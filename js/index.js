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
 *   value :: Number, -- a number between 0 to 9. Non zero number represents 'given'.
 *   memo  :: Array,  -- array of the numbers, those of which can be placed, user considers.
 * }
 */
const rootVm = new Vue({
    el: '#app-sudoku',
    template: `
    <div class="boxes"
    tabindex="0"
    @keydown.49="affected.forEach(cell => cell.memo.splice(0, 1, ''))"
    @keydown.50="affected.forEach(cell => cell.memo.splice(1, 1, ''))"
    @keydown.51="affected.forEach(cell => cell.memo.splice(2, 1, ''))"
    @keydown.52="affected.forEach(cell => cell.memo.splice(3, 1, ''))"
    @keydown.53="affected.forEach(cell => cell.memo.splice(4, 1, ''))"
    @keydown.54="affected.forEach(cell => cell.memo.splice(5, 1, ''))"
    @keydown.55="affected.forEach(cell => cell.memo.splice(6, 1, ''))"
    @keydown.56="affected.forEach(cell => cell.memo.splice(7, 1, ''))"
    @keydown.57="affected.forEach(cell => cell.memo.splice(8, 1, ''))"
    >
        <div class="box-row" v-for="span in [[0, 3], [3, 6], [6, 9]]">
            <div class="box" v-for="values in boxes.slice(span[0], span[1])">
                <div class="row-in-box" v-for="span in [[0, 3], [3, 6], [6, 9]]">
                    <span v-for="cell in values.slice(span[0], span[1])"
                    :class="{cell: 1, hover: affected.includes(cell), }"
                    @mouseenter="pointed = cell" @mouseleave="pointed = null"
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
        affected: function() {
            const pointed = this.cells.indexOf(this.pointed);
            if (pointed !== -1) {
                const col = pointed % 9;
                const row = (pointed - col) / 9;
                const boxOffset = ~~(col / 3) * 3 + ~~(row / 3) * 27;
                return [
                    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(v => v + row * 9),
                    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(v => v * 9 + col),
                    [0, 1, 2, 9, 10, 11, 18, 19, 20].map(v => v + boxOffset),
                ].reduce((a, b) => a.concat(b)).map(index => this.cells[index]);
            } else {
                return [];
            }
        },
        boxes: function() {
            const OFFSETS = [0, 3, 6, 27, 30, 33, 54, 57, 60,];
            const INDICES = [0, 1, 2, 9, 10, 11, 18, 19, 20,];
            return OFFSETS.map(offset => INDICES.map(index => this.cells[index + offset]));
        },
    },
    data: () => new Object({
        cells: Array.from(
            '060003001200500600007090500000400090800000006010005000002010700004009003700200040' // 朝日新聞beパズル 2017/10/07 掲載分
        ).map(n => new Object({ value: Number(n), memo: [1,2,3,4,5,6,7,8,9,], })),
        pointed: null,
    }),
    methods: {
        slice: slice,
    },
});
