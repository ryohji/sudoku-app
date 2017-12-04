const rootVm = new Vue({
    el: '#app-sudoku',
    template: `
    <div class="boxes"
    tabindex="0"
    @keydown="onKey"
    @keydown.space="flush"
    @click="flush"
    @mouseenter="event => event.target.focus()"
    >
        <div class="box-row" v-for="span in [[0, 3], [3, 6], [6, 9]]">
            <div class="box" v-for="values in boxes.slice(span[0], span[1])">
                <div class="row-in-box" v-for="span in [[0, 3], [3, 6], [6, 9]]">
                    <span v-for="cell in values.slice(span[0], span[1])"
                    :class="{cell: 1, hover: affectedIndices.includes(cells.indexOf(cell)), }"
                    @mouseenter="pointed = cells.indexOf(cell)"
                    >
                        <span v-if="cell.given" class="given">{{ cell.value }}</span>
                        <span v-else-if="cell.value">{{ cell.value }}</span>
                        <div  v-else class="memo" v-for="memo in slice(cell.memo.map((set, i) => set ? i + 1 : ''), 3)">
                            <span v-for="n in memo">{{ n }}</span>
                        </div>
                    </span>
                </div>
            </div>
        </div>
    </div>`,
    computed: {
        affectedIndices: function() {
            const get = array => {
                const index = array.findIndex(x => x === this.pointed);
                const start = 9 * ~~(index / 9);
                return array.slice(start, start + (index !== -1 ? 9 : 0));
            };
            return [get(this.indices.row), get(this.indices.col), get(this.indices.box)]
            .reduce((a, b) => a.concat(b)) // flatten array
            .filter(value => value !== this.pointed) // remove pointed itself
            .filter((value, index, array) => array.indexOf(value) === index); // remove duplicates
        },
        boxes: function() {
            return this.slice(this.indices.box.map(index => this.cells[index]), 9);
        },
        cells: function() {
            /* manage each number cell by the object: {
                {Boolean} given, -- true if the number is given for clue, otherwise false.
                {Number} value, -- a number between 0 to 9.
                {Array} memo, -- array of Boolean, each element represent the number those of which can be placed, user considers.
            } */
            const initial = Array.from(
                '060003001200500600007090500000400090800000006010005000002010700004009003700200040' // 朝日新聞beパズル 2017/10/07 掲載分
            ).map(Number).map(n => new Object({given: Boolean(n), value: n, memo: Array(9), }));
            const commands = this.history.commands.slice(0, this.history.current + 1);
            return commands.reduce((board, command) => {
                switch(command.type) {
                case 'place':
                    board[command.where].value = command.value;
                    break;
                case 'remark':
                    board[command.where].memo.splice(command.value - 1, 1, true);
                    break;
                case 'unmark':
                    board[command.where].memo.splice(command.value - 1, 1, false);
                    break;
                case 'flush':
                    command.where.forEach(index => board[index].memo.splice(command.value - 1, 1, false));
                    break;
                }
                return board;
            }, initial);
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
        pointedCell: function() { return this.cells[this.pointed]; },
    },
    data: () => new Object({
        pointed: -1,
        /* user operations. this backs undo/redo up */
        history: {commands: [], current: -1, },
    }),
    methods: {
        slice: (() => {
            const splitAt = (array, n) => [array.slice(0, n), array.slice(n)];
            const reduceConcat = a => a.length ? a.reduce((a, b) => [a].concat(reduceConcat(b))) : [];
        
            return (array, n) => {
                const splitted = splitAt(array, n);
                var p = splitted;
                while (p[1].length !== 0) {
                    p[1] = splitAt(p[1], n);
                    p = p[1];
                }
                return reduceConcat(splitted);
            };
        })(),
        onKey: function(event) {
            const match = /^Digit(.)$/.exec(event.code);
            if (match && this.pointed !== -1) {
                const type = event.altKey ? event.shiftKey ? 'unmark' : 'remark' : 'place';
                this.history.commands.push({type: type, value: match[1], where: this.pointed, when: new Date(), });
                this.history.current += 1;
            } else if (event.code === 'Backspace') {
                this.history.commands.push({type: 'place', value: 0, where: this.pointed, when: new Date(), });
                this.history.current += 1;
            }
        },
        flush: function() {
            if (this.pointed !== -1) {
                const history = this.history;
                history.commands.push({type: 'flush', value: this.pointedCell.value, where: this.affectedIndices, when: new Date(), });
                history.current += 1;
            }
        },
    },
});
