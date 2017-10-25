const rootVm = new Vue({
    el: '#app-sudoku',
    template: `
    <div>
    <numbers-box :numbers="boxes[0]" /><numbers-box :numbers="boxes[1]" /><numbers-box :numbers="boxes[2]" /><br />
    <numbers-box :numbers="boxes[3]" /><numbers-box :numbers="boxes[4]" /><numbers-box :numbers="boxes[5]" /><br />
    <numbers-box :numbers="boxes[6]" /><numbers-box :numbers="boxes[7]" /><numbers-box :numbers="boxes[8]" /><br />
    </div>`,
    components: {
        'numbers-box': {
            props: { numbers: Array, },
            template: `<span style="display: inline-block;">
            <span v-for="n in numbers.slice(0, 3)" :class="{'cell': 1, fixed: n}">{{ n || '' }}</span><br />
            <span v-for="n in numbers.slice(3, 6)" :class="{'cell': 1, fixed: n}">{{ n || '' }}</span><br />
            <span v-for="n in numbers.slice(6, 9)" :class="{'cell': 1, fixed: n}">{{ n || '' }}</span><br />
            </span>`,
        },
    },
    computed: {
        rows: function() {
            const splitAt = (array, n) => [array.slice(0, n), array.slice(n)];
            const rows = splitAt(Array.from(this.board).map(Number), 9);
            var p = rows;
            while (p[1].length !== 0) {
                p[1] = splitAt(p[1], 9);
                p = p[1];
            }
            const reduceConcat = a => a.length ? a.reduce((a, b) => [a].concat(reduceConcat(b))) : [];
            return reduceConcat(rows);
        },
        boxes: function() {
            const rows = this.rows;
            return [
                [].concat(rows[0].slice(0, 3), rows[1].slice(0, 3), rows[2].slice(0, 3)),
                [].concat(rows[0].slice(3, 6), rows[1].slice(3, 6), rows[2].slice(3, 6)),
                [].concat(rows[0].slice(6, 9), rows[1].slice(6, 9), rows[2].slice(6, 9)),

                [].concat(rows[3].slice(0, 3), rows[4].slice(0, 3), rows[5].slice(0, 3)),
                [].concat(rows[3].slice(3, 6), rows[4].slice(3, 6), rows[5].slice(3, 6)),
                [].concat(rows[3].slice(6, 9), rows[4].slice(6, 9), rows[5].slice(6, 9)),

                [].concat(rows[6].slice(0, 3), rows[7].slice(0, 3), rows[8].slice(0, 3)),
                [].concat(rows[6].slice(3, 6), rows[7].slice(3, 6), rows[8].slice(3, 6)),
                [].concat(rows[6].slice(6, 9), rows[7].slice(6, 9), rows[8].slice(6, 9)),
            ];
        },
    },
    data: () => new Object({
        board: '060003001200500600007090500000400090800000006010005000002010700004009003700200040',
    }),
});
