const slice = (() => {
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
})();

/**
 * manage each number cell by the object
 * {
 *   index :: Number, -- row based index of the cell.
 *   value :: Number, -- a number between 0 to 9. Non zero number represents 'given'.
 *   memo  :: Array,  -- array of the numbers, those of which can be placed, user considers.
 * }
 */
const rootVm = new Vue({
    el: '#app-sudoku',
    template: `
    <div class="boxes"
    tabindex="0"
    @keydown.49="hoveringCells.forEach(cell => cell.memo[0] = '')"
    @keydown.50="hoveringCells.forEach(cell => cell.memo[1] = '')"
    @keydown.51="hoveringCells.forEach(cell => cell.memo[2] = '')"
    @keydown.52="hoveringCells.forEach(cell => cell.memo[3] = '')"
    @keydown.53="hoveringCells.forEach(cell => cell.memo[4] = '')"
    @keydown.54="hoveringCells.forEach(cell => cell.memo[5] = '')"
    @keydown.55="hoveringCells.forEach(cell => cell.memo[6] = '')"
    @keydown.56="hoveringCells.forEach(cell => cell.memo[7] = '')"
    @keydown.57="hoveringCells.forEach(cell => cell.memo[8] = '')"
    >
        <div class="box-row" v-for="span in [[0, 3], [3, 6], [6, 9]]">
            <div class="box" v-for="values in boxes.slice(span[0], span[1])">
                <div class="row-in-box" v-for="span in [[0, 3], [3, 6], [6, 9]]">
                    <span v-for="cell in values.slice(span[0], span[1])"
                    :class="{cell: 1, hover: hovering.includes(cell.index), }"
                    @mouseenter="hover = cell.index" @mouseleave="hover = null"
                    >
                    <span v-if="cell.value" class="given">{{ cell.value }}</span>
                    <div  v-else class="memo" v-for="memo in slice(cell.memo, 3)">
                        <span v-for="n in memo">{{ n }}</span>
                    </div>
                </span>
                </div>
            </div>
        </div>
    </div>`,
    computed: {
        hovering: (() => {
            const ONE_TO_EIGHT = Array.from({length: 9}).map((_, index) => index);
            return function() {
                const hover = this.hover;
                if (hover) {
                    const col = hover % 9;
                    const row = (hover - col) / 9;
                    const idx = ~~(col / 3) + ~~(row / 3) * 3;
                    const boxOffset = [0, 3, 6, 27, 30, 33, 54, 57, 60][idx];
                    return [].concat(ONE_TO_EIGHT.map(v => v + row * 9),
                    ONE_TO_EIGHT.map(v => v * 9 + col),
                    [0, 1, 2, 9, 10, 11, 18, 19, 20].map(v => v + boxOffset)
                    );
                } else {
                    return [];
                }
            };
        })(),
        hoveringCells: function() {
            const hovering = this.hovering;
            return this.boxes.reduce((a, b) => a.concat(b)).filter(cell => hovering.includes(cell.index));
        },
        boxes: function() {
            const OFFSETS = [0, 3, 6, 27, 30, 33, 54, 57, 60,];
            const INDICES = [0, 1, 2, 9, 10, 11, 18, 19, 20,];
            return OFFSETS.map(offset => INDICES.map(index => this.cells[index + offset]));
        },
    },
    created: function() {
        const makeCellObject = (n, index) => new Object({ index: index, value: Number(n), memo: [1,2,3,4,5,6,7,8,9,], });
        this.cells = Array.from(this.board).map(makeCellObject);
    },
    data: () => new Object({
        board: '060003001200500600007090500000400090800000006010005000002010700004009003700200040', // 朝日新聞beパズル 2017/10/07 掲載分
        cells: undefined,
        hover: null,
    }),
    methods: {
        slice: slice,
    },
});
