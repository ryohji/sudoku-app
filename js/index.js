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
    <div class="boxes">
        <div class="box-row" v-for="span in [[0, 3], [3, 6], [6, 9]]">
            <div class="box" v-for="values in boxes.slice(span[0], span[1])">
                <div class="row-in-box" v-for="span in [[0, 3], [3, 6], [6, 9]]">
                    <span v-for="cell in values.slice(span[0], span[1])" class="cell">
                        <span v-if="cell.value" class="given">{{ cell.value }}</span>
                        <div  v-else class="memo" v-for="memo in slice(cell.memo, 3)">
                            <span v-for="n in memo">{{ n }}</span>
                        </div>
                    </span>
                </div>
            </div>
        </div>
    </div>`,
    created: function() {
        const OFFSETS = [0, 3, 6, 27, 30, 33, 54, 57, 60,];
        const INDICES = [0, 1, 2, 9, 10, 11, 18, 19, 20,];
        const makeCellObject = (n, index) => new Object({ index: index, value: Number(n), memo: [1,2,3,4,5,6,7,8,9,], });
        const cells = Array.from(this.board).map(makeCellObject);
        this.boxes = OFFSETS.map(offset => INDICES.map(index => cells[index + offset]));
    },
    data: () => new Object({
        board: '060003001200500600007090500000400090800000006010005000002010700004009003700200040', // 朝日新聞beパズル 2017/10/07 掲載分
        boxes: undefined,
    }),
    methods: {
        slice: slice,
    },
});
