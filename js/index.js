const rootVm = new Vue({
    el: '#app-sudoku',
    template: `
    <div class="boxes"
    tabindex="0"
    @keydown.delete="place(0)"
    @keydown.48="place(0)"
    @keydown.49="place(1)"
    @keydown.50="place(2)"
    @keydown.51="place(3)"
    @keydown.52="place(4)"
    @keydown.53="place(5)"
    @keydown.54="place(6)"
    @keydown.55="place(7)"
    @keydown.56="place(8)"
    @keydown.57="place(9)"
    @keydown.space="affectedIndices.forEach(index => cells[index].memo.splice(pointedCell.value - 1, 1, false))"
    @click="affectedIndices.forEach(index => cells[index].memo.splice(pointedCell.value - 1, 1, false))"
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
            const index = this.pointed;
            if (index === -1) {
                return [];
            } else {
                const col = index % 9;
                const row = (index - col) / 9;
                const boxOffset = ~~(col / 3) * 3 + ~~(row / 3) * 27;
                return [
                    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(v => v + row * 9),
                    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(v => v * 9 + col),
                    [0, 1, 2, 9, 10, 11, 18, 19, 20].map(v => v + boxOffset),
                ]
                .reduce((a, b) => a.concat(b)) // flatten array
                .filter(value => value !== index) // remove pointed itself
                .filter((value, index, array) => array.indexOf(value) === index); // remove duplicates
            }
        },
        boxes: function() {
            const OFFSETS = [0, 3, 6, 27, 30, 33, 54, 57, 60,];
            const INDICES = [0, 1, 2, 9, 10, 11, 18, 19, 20,];
            return OFFSETS.map(offset => INDICES.map(index => this.cells[index + offset]));
        },
        cells: function() {
            /* manage each number cell by the object: {
                {Boolean} given, -- true if the number is given for clue, otherwise false.
                {Number} value, -- a number between 0 to 9.
                {Array} memo, -- array of Boolean, each element represent the number those of which can be placed, user considers.
            } */
            const initial = Array.from(
                '060003001200500600007090500000400090800000006010005000002010700004009003700200040' // 朝日新聞beパズル 2017/10/07 掲載分
            ).map(Number).map(n => new Object({given: Boolean(n), value: n, memo: Array(9).fill(true), }));
            const commands = this.history.commands.slice(0, this.history.current + 1);
            return commands.reduce((board, command) => {
                switch(command.type) {
                case 'place':
                    board[command.where].value = command.value;
                    break;
                }
                return board;
            }, initial);
        },
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
        place: function(number) {
            if (this.pointed !== -1) {
                const history = this.history;
                history.commands.push({type: 'place', value: number, where: this.pointed, when: new Date(), });
                history.current += 1;
            }
        },
    },
});
