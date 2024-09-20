// style="margin-left:-400px"
// 0 : margin-left: 0px; (-400 * 0)
// 1 : margin-left: -400px; (-400 * 1)
// 2 : margin-left: -800px; (-400 * 2)
// 3 : margin-left: -1200px; (-400 * 3)
// 4 : margin-left: -1600px; (-400 * 4)

const frame = document.querySelector("main");
// 위에 main을 찾아놔서 밑에 frame으로 찾아주는게 효율적이다.
const panel = frame.querySelector(".panel");
const btns = frame.querySelectorAll(".btns li");

btns.forEach((btn, idx) => {
	btn.addEventListener("click", () => {
		console.log(idx);

		new Anime(panel, { marginLeft: -400 * idx }, { duration: 500 });

		// panel.style.marginLeft = -400 * idx + "px";
	});
});

// 미션 - 위의 코드에서 각각의 버튼을 클릭하면 해당 순번의 패널이 프레임 안쪽으로 들어오도록 new Anime를 활용해 좌우 슬라이더 모션 처리 (3시 50분까지)
