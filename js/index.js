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

const rootVm = new Vue({
    el: '#app-sudoku',
    template: `
    <div class="boxes">
        <div class="box-row" v-for="span in [[0, 3], [3, 6], [6, 9]]">
            <div class="box" v-for="numbers in boxes.slice(span[0], span[1])">
                <div class="row-in-box" v-for="span in [[0, 3], [3, 6], [6, 9]]">
                    <span v-for="n in numbers.slice(span[0], span[1])" :class="{'cell': 1, given: n}">{{
                        n || ''
                    }}<div v-if="!n && !memo.hidden" class="memo" v-for="memo in [[1,2,3],[4,5,6],[7,8,9]]">
                    <span v-for="n in memo">{{ n }}</span>
                    </div></span>
                </div>
            </div>
        </div>
    </div>`,
    computed: {
        boxes: function() {
            const rows = this.rows;
            const sliced = rows.map(row => slice(row, 3));
            return [
                [].concat(sliced[0][0], sliced[1][0], sliced[2][0]),
                [].concat(sliced[0][1], sliced[1][1], sliced[2][1]),
                [].concat(sliced[0][2], sliced[1][2], sliced[2][2]),
                
                [].concat(sliced[3][0], sliced[4][0], sliced[5][0]),
                [].concat(sliced[3][1], sliced[4][1], sliced[5][1]),
                [].concat(sliced[3][2], sliced[4][2], sliced[5][2]),

                [].concat(sliced[6][0], sliced[7][0], sliced[8][0]),
                [].concat(sliced[6][1], sliced[7][1], sliced[8][1]),
                [].concat(sliced[6][2], sliced[7][2], sliced[8][2]),
            ];
        },
    },
    created: function() {
        this.rows = slice(Array.from(this.board).map(Number), 9);
        this.memo.data = Array.from({length: 81}).map(_ => [1,2,3,4,5,6,7,8,9,]);
    },
    data: () => new Object({
        board: '060003001200500600007090500000400090800000006010005000002010700004009003700200040', // 朝日新聞beパズル 2017/10/07 掲載分
        rows: undefined,
        memo: { hidden: false, },
    }),
});
