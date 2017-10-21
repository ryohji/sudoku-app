const rootVm = new Vue({
    el: '#app-sudoku',
    template: `
    <div>
    <span v-for="row in rows">{{ row }}<br /></span>
    </div>`,
    computed: {
        rows: function() {
            const splitAt = (array, n) => [array.slice(0, n), array.slice(n)];
            const reduceConcat = a => [a[0]].concat(a[1].length ? reduceConcat(a[1]) : []);
            const rows = splitAt(Array.from(this.board).map(Number), 9);
            var p = rows;
            while (p[1].length !== 0) {
                p[1] = splitAt(p[1], 9);
                p = p[1];
            }
            return reduceConcat(rows);
        },
    },
    data: () => new Object({
        board: '060003001200500600007090500000400090800000006010005000002010700004009003700200040',
    }),
});
