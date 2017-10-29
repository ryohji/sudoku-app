const rootVm = new Vue({
    el: '#app-sudoku',
    template: `
    <span>{{ board }}</span>
    `,
    data: () => new Object({
        board: '060003001200500600007090500000400090800000006010005000002010700004009003700200040', // 朝日新聞beパズル 2017/10/07 掲載分
    }),
});
