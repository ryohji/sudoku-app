const rootVm = new Vue({
    el: '#app-sudoku',
    template: `
    <div>
        <div class="sudoku"
        tabindex="0"
        @keydown="onKey"
        @keydown.space="flush"
        @click="flush"
        @mouseenter="event => event.target.focus()"
        >
            <number-cell class="cell" v-for="cell in cells" :key="cells.indexOf(cell)"
            @mouseenter="pointed = cells.indexOf(cell)"
            :cell="cell"
            :affected="affectedIndicesBy(pointed).includes(cells.indexOf(cell))"
            :misplaced="missPlacedIndices.includes(cells.indexOf(cell))"
            />
        </div>
        <div class="history">
            <historical-event :event="command" :key="index" :active="history.commands.length - index === history.current"
            v-for="(command, index) in Array.from(history.commands).reverse()" />
            <div :class="{event: 1, active: history.current === 0, }">initial</div>
        </div>
    </div>`,
    components: {
        'number-cell': {
            props: {cell: Object, affected: Boolean, misplaced: Boolean, },
            template: `
            <span @mouseenter="$emit('mouseenter')" :class="{hover: affected, error: misplaced, given: cell.given, }" >{{
                cell.value !== 0 ? cell.value : ''
                }}<span v-if="cell.value === 0" v-for="n in memoNumbers">{{ n }}</span>
            </span>
            `,
            computed: {
                memoNumbers: function() { return this.cell.memo.map((set, i) => set ? i + 1 : ''); },
            },
        },
        'historical-event': {
            props: { event: Object, active: Boolean, },
            template: '<div :class="{event: 1, active: active, }">{{ where + " " + what }}</div>',
            computed: {
                where: function() {
                    const where = this.event.where;
                    return '(' + (~~(where / 9) + 1) + ',' + (where % 9 + 1) + ')';
                },
                what: function() {
                    switch(this.event.type) {
                    case 'erase': return 'erase';
                    default: return this.event.type + ' ' + this.event.value;
                    }
                },
            },
        }
    },
    computed: {
        cells: function() {
            /* manage each number cell by the object: {
                {Boolean} given, -- true if the number is given for clue, otherwise false.
                {Number} value, -- a number between 0 to 9.
                {Array} memo, -- array of Boolean, each element represent the number those of which can be placed, user considers.
            } */
            return this.history.commands.slice(0, this.history.current).reduce((cells, command) => {
                switch(command.type) {
                case 'place':
                case 'erase':
                    cells[command.where].value = command.value;
                    break;
                case 'remark':
                case 'unmark':
                    cells[command.where].memo[command.value - 1] = command.type[0] === 'r';
                    break;
                case 'flush':
                    this.affectedIndicesBy(command.where).forEach(index => cells[index].memo[command.value - 1] = false);
                    break;
                }
                return cells;
            }, Array.from( // initial cells
                '060003001200500600007090500000400090800000006010005000002010700004009003700200040' // 朝日新聞beパズル 2017/10/07 掲載分
            ).map(Number).map(n => new Object({given: n !== 0, value: n, memo: Array(9), })));
        },
        missPlacedIndices: function() {
            const unique = (value, index, array) => array.indexOf(value) === index;
            const indices = [this.indices.row, this.indices.col, this.indices.box].reduce((a, b) => a.concat(b));
            const dupOrNot = this.chunksOf(9, indices.map(index => this.cells[index].value)) // for each 9...
            .map(vs => vs.map((v, i, self) => v && self.slice(0, i).concat(self.slice(i+1)).some(x => x === v))) // flag non-zero and duplicates
            .reduce((a, b) => a.concat(b));
            return dupOrNot.map((v, i) => v ? indices[i] : NaN).filter(unique); // NaN will be removed by unique.
        },
        indices: (() => {
            const colNr = index => index % 9;
            const boxNr = index => 3 * ~~(index / 27) + ~~((index % 9) / 3);
            const row = Array.from({length: 81, }).map((_, index) => index);
            const col = Array.from(row).sort((a, b) => colNr(a) - colNr(b));
            const box = Array.from(row).sort((a, b) => boxNr(a) - boxNr(b));
            const indices = { row: row, col: col, box: box, };
            return () => indices;
        })(),
        pointedCell: function() { return this.cells[this.pointed] || {given: true, }; },
    },
    data: () => new Object({
        pointed: -1,
        /* user operations. this backs undo/redo up.
        `current` points `commands` array index where new command to be inserted into. */
        history: {commands: [], current: 0, },
    }),
    methods: {
        chunksOf: (n, array) => Array.from({
            [Symbol.iterator]: () => {
                var i = 0;
                return { next: () => new Object({done: i >= array.length, value: array.slice(i, i += n), }), };
            },
        }),
        affectedIndicesBy: function(cellIndex) {
            const get = array => {
                const index = array.findIndex(x => x === cellIndex);
                const start = 9 * ~~(index / 9);
                return array.slice(start, start + (index !== -1 ? 9 : 0));
            };
            return [get(this.indices.row), get(this.indices.col), get(this.indices.box)]
            .reduce((a, b) => a.concat(b)) // flatten array
            .filter(value => value !== cellIndex) // remove cellIndex itself
            .filter((value, index, array) => array.indexOf(value) === index); // remove duplicates
        },
        onKey: function(event) {
            const ALT = event.altKey;
            const SHIFT = event.shiftKey;
            const NUMBER = Number((/^Digit([1-9])$/.exec(event.code) || [])[1]);
            const UNDO = event.code === 'KeyZ' && ALT && !SHIFT;
            const REDO = (event.code === 'KeyZ' && ALT && SHIFT) || (event.code === 'KeyY' && ALT && !SHIFT);
            if (ALT && NUMBER && this.pointed !== -1) {
                this.mark(NUMBER, !SHIFT);
            } else if (!ALT && NUMBER && !this.pointedCell.given) {
                this.place(NUMBER);
            } else if (['Digit0', 'Backspace'].includes(event.code) && !this.pointedCell.given) {
                this.erase();
            } else if (UNDO && this.history.current !== 0) {
                this.history.current -= 1;
            } else if (REDO && this.history.current != this.history.commands.length) {
                this.history.current += 1;
            }
        },
        place: function(number) {
            this.push({value: number, type: 'place', });
        },
        erase: function() {
            this.push({value: 0, type: 'erase', });
        },
        mark: function(number, mark) {
            this.push({value: number, type: mark ? 'remark' : 'unmark', });
        },
        flush: function() {
            this.push({value: this.pointedCell.value, type: 'flush', });
        },
        push: function(command) {
            this.history.commands.splice(this.history.current ++, Infinity,
                Object.assign({when: new Date(), where: this.pointed, }, command));
        },
    },
});
