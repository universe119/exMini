// Anime 클래스 정의 클래스 정의는 항상 첫글자는 대문자로 지정.
class Anime {
	// 클래스의 기본 옵션을 정의함, duration(애니메이션 지속 시간), callback(애니메이션이 끝나면 호출되는 함수), easeType(애니메이션의 이징(=가속도) 타입)을 설정하며, #은 프라이빗 필드를 의미하며, 외부에서 접근이 불가능하게 만듭니다.
	// 1. #에 대해 자세한 내용 -> #은 자바스크립트에서 프라이빗 필드를 정의하는 새로운 문법입니다. 프라이빗 필드는 클래스 외부에서 접근할 수 없고, 클래스 내부에서만 사용할 수 있습니다.
	#defOpt = { duration: 500, callback: null, easeType: "linear" };

	// 생성자 정의 constructor는 클래스가 생성될 때 호출되는 메서드, 클래스는 selector, props, opt 세 가지 인자를 받음
	// selector: 애니메이션을 적용할 HTML 요소
	// props: 변경할 CSS 속성 및 값
	// opt: 애니메이션 옵션 (지속 시간, 이징, 콜백 등)
	constructor(selector, props, opt) {
		// selector(HTML요소)를 클래스의 인스턴스 변수 this.selector에 저장
		this.selector = selector;

		// 기본 옵션인 this.#defOpt와 사용자가 전달한 옵션 opt를 병합, 최종 옵션을 this.defOpt에 저장하며, 사용자 옵션이 기본 옵션을 덮어씁니다.
		// 2. -> 이 구문은 객체 병합을 수행하는 방식입니다.
		// { ...this.#defOpt, ...opt }에서 ...은 스프레드 연산자라고 불리며, 객체나 배열의 모든 요소를 펼쳐줍니다.
		this.defOpt = { ...this.#defOpt, ...opt };

		// props 객체의 키와 값을 각각 this.keys와 this.values에 배열 형태로 저장합니다.
		// 예: props = { width: "100px", opacity: 0.5 }일 때, keys는 ['width', 'opacity'], values는 ['100px', 0.5]가 됩니다.
		// 3. -> Object는 자바스크립트의 전역 객체로, 객체를 다루는 여러 메서드를 제공 Object.keys(props); // ["width", "height"]
		this.keys = Object.keys(props);
		this.values = Object.values(props);

		// 애니메이션 옵션(duration, callback, easeType)을 this.defOpt에서 가져와 각각 인스턴스 변수로 저장합니다.
		this.duration = this.defOpt.duration;
		this.callback = this.defOpt.callback;
		this.easeType = this.defOpt.easeType;

		// 애니메이션이 시작되는 시점을 기록합니다. performance.now()는 고해상도 타이머로, 현재 시간을 밀리초 단위로 반환합니다.
		// 4. -> performance.now()는 브라우저 API로, 현재 시점부터 경과된 시간을 밀리초 단위로 반환합니다.
		// 이는 CPU 시간이 아닌 고해상도 타이머를 사용하므로 매우 정확합니다. 일반적으로 애니메이션의 시작 시점과 경과 시간을 계산하는 데 사용됩니다.
		this.startTime = performance.now();

		// isBg는 색상 애니메이션인지 아닌지 판단하는 변수입니다. 처음에는 null로 설정됩니다.
		this.isBg = null;

		// 각 속성에 대한 애니메이션 설정 forEach를 돌려서 css속성이 문자인지 퍼센트인지 컬러인지 숫자인지 확인하는거
		// 3항연산자를 2개쓴건가,,? 5. typeof ? -> typeof와 ? : (삼항 연산자)
		// typeof는 자바스크립트에서 데이터의 타입을 확인하는 연산자입니다. 값이 숫자인지, 문자열인지, 객체인지 등을 확인할 수 있습니다.
		// ? :는 삼항 연산자라고 불리며, 조건에 따라 다른 값을 반환하는 간단한 if-else 구조입니다.
		// condition ? expr1 : expr2
		// condition이 true이면 expr1이 실행되고, false이면 expr2가 실행됩니다.
		this.keys.forEach((key, idx) => {
			// 각 속성 값(this.values[idx])의 타입에 따라 처리 방식을 다르게 합니다:

			// 값이 문자열일 경우(typeof this.values[idx] === "string") 퍼센트 값인지 확인합니다.
			typeof this.values[idx] === "string"
				? // 퍼센트 값이면("%")), getValue 메서드를 호출하고 percent로 처리합니다.
				  //6. -> includes()는 자바스크립트에서 문자열이나 배열에 특정 값이 포함되어 있는지 확인하는 메서드입니다.
				  // 반환 값은 true 또는 false입니다.
				  // 코드에서 includes("%")는 값에 퍼센트 기호가 포함되어 있는지 확인하는 부분입니다. %가 있으면 퍼센트 기반의 애니메이션을 처리하고, 없으면 다른 유형으로 처리합니다.
				  this.values[idx].includes("%")
					? this.getValue(key, this.values[idx], "percent")
					: // 퍼센트가 아니면 color로 처리합니다.
					  this.getValue(key, this.values[idx], "color")
				: // 값이 숫자일 경우에는 basic으로 처리합니다.
				  this.getValue(key, this.values[idx], "basic");
		});
	}

	//getValue 메서드 정의 : 이 메서드는 key(CSS 속성), value(변경할 값), type(값의 타입: percent, color, basic)을 인자로 받아서 현재 요소의 CSS 속성을 변경하는 데 필요한 정보를 처리합니다.
	// 위에 getValue에서 확인해서 값을 가져오는 메서드
	getValue(key, value, type) {
		//현재 CSS 속성 값을 저장할 변수를 선언합니다.
		let currentValue = null;

		//getComputedStyle을 사용해 선택한 요소(this.selector)의 현재 key 속성 값을 가져옵니다. 이 값은 문자열이기 때문에 parseFloat()로 소수점 숫자로 변환합니다.
		// currentValue = parseFloat(getComputedStyle(this.selector)[key]);

		// currentValue = this.selector.scrollY;
		// 만약 key가 scroll이면, 현재 스크롤 위치(scrollY) 값을 가져옵니다. 그렇지 않으면 getComputedStyle을 사용해 CSS 속성 값을 가져옵니다.
		key === "scroll"
			? (currentValue = this.selector.scrollY)
			: (currentValue = parseFloat(getComputedStyle(this.selector)[key]));
		// currentValue = this.selector.scrollY;

		// 값이 퍼센트(percent) 타입일 때, 부모 요소의 크기 비율에 따라 계산합니다.
		if (type === "percent") {
			// 부모 요소의 width와 height 값을 가져와서, 자식 요소가 부모 크기에 맞춰 퍼센트 단위로 애니메이션이 동작하도록 계산합니다.
			const parentW = parseInt(
				getComputedStyle(this.selector.parentElement).width
			);
			const parentH = parseInt(
				getComputedStyle(this.selector.parentElement).height
			);
			// x와 y 배열은 수평(left, right, width) 및 수직(top, bottom, height)과 관련된 속성들을 정의합니다.
			const x = ["left", "right", "width"];
			const y = ["top", "bottom", "height"];

			// 마진과 패딩은 퍼센트 단위로 애니메이션을 적용할 수 없으므로, 에러 메시지를 출력합니다.
			if (key.includes("margin") || key.includes("padding"))
				return console.error(
					"margin, padding값은 퍼센트 모션처리할 수 없습니다."
				);

			// 속성이 x에 속하면 부모 요소의 너비로 퍼센트를 계산하고, y에 속하면 부모 요소의 높이로 퍼센트를 계산합니다.
			for (let cond of x)
				key === cond && (currentValue = (currentValue / parentW) * 100);
			for (let cond of y)
				key === cond && (currentValue = (currentValue / parentH) * 100);

			// 목표 값이 현재 값과 다르면 requestAnimationFrame()을 호출하여 애니메이션을 시작합니다.
			const percentValue = parseFloat(value);
			percentValue !== currentValue &&
				requestAnimationFrame((time) =>
					this.run(time, key, currentValue, percentValue, type)
				);
		}
		// 색상 애니메이션을 처리합니다. 현재 색상을 colorToArray()로 RGB 배열로 변환하고, 목표 색상을 hexToRgb()로 변환합니다. 현재 값과 목표 값이 다르면 애니메이션을 시작합니다.
		if (type === "color") {
			this.isBg = true;
			currentValue = getComputedStyle(this.selector)[key];
			currentValue = this.colorToArray(currentValue);
			value = this.hexToRgb(value);
			value !== currentValue &&
				requestAnimationFrame((time) =>
					this.run(time, key, currentValue, value, type)
				);
		}
		// 기본 애니메이션(예: width, opacity)일 경우, 현재 값과 목표 값이 다르면 애니메이션을 시작합니다.
		if (type === "basic") {
			value !== currentValue &&
				requestAnimationFrame((time) =>
					this.run(time, key, currentValue, value, type)
				);
		}
	}
	// run() 메서드 : getProgress() 메서드를 호출해 애니메이션 진행 상황을 계산하고, setValue()를 통해 새로운 값을 설정합니다.
	run(time, key, currentValue, value, type) {
		let [progress, result] = this.getProgress(time, currentValue, value);
		this.setValue(key, result, type);

		// 진행률이 1(100%) 미만이면 계속해서 애니메이션을 실행하고, 1에 도달하면 애니메이션이 완료되어 콜백 함수를 호출합니다.
		progress < 1
			? ["percent", "color", "basic"].map(
					(el) =>
						type === el &&
						requestAnimationFrame((time) =>
							this.run(time, key, currentValue, value, type)
						)
			  )
			: this.callback && this.callback();
	}

	// getProgress() 메서드 : 애니메이션이 진행된 시간을 계산하고, 애니메이션 진행률(progress)을 0에서 1 사이로 조정합니다. 색상 애니메이션인 경우 isBg를 true로 설정합니다.
	getProgress(time, currentValue, value) {
		let easingProgress = null;
		currentValue.length ? (this.isBg = true) : (this.isBg = false);
		let timelast = time - this.startTime;
		let progress = timelast / this.duration;
		progress < 0 && (progress = 0);
		progress > 1 && (progress = 1);

		// 이징(가속도) 함수는 BezierEasing을 사용해, linear 또는 다른 프리셋에 따라 애니메이션의 속도 변화를 계산합니다.
		const easingPresets = {
			linear: [0, 0, 1, 1],
			ease1: [0.22, -1.27, 0.58, 1.87],
			ease2: [0, 1.82, 0.94, -0.73],
		};

		/*
		Object.keys(easingPresets).map((key) => {
			if (this.easeType === key) easingProgress = BezierEasing(easingPresets[key][0], easingPresets[key][1], easingPresets[key][2], easingPresets[key][3])(progress);
		});
		*/

		Object.keys(easingPresets).map(
			(key) =>
				this.easeType === key &&
				(easingProgress = BezierEasing(...easingPresets[key])(progress))
		);

		/* // 현재 값과 목표 값 사이의 중간 값을 계산해 반환합니다. progress와 result는 각각 진행률과 계산된 값을 나타냅니다.
		if (this.isBg) {
			const result = currentValue.map((curVal, idx) => curVal + (value[idx] - curVal) * easingProgress);
			return [progress, result];
		} else {
			const result = currentValue + (value - currentValue) * easingProgress;
			return [progress, result];
		}
		*/

		/*
		return this.isBg
			? [progress, currentValue.map((curVal, idx) => curVal + (value[idx] - curVal) * easingProgress)]
			: [progress, currentValue + (value - currentValue) * easingProgress];
		*/

		return [
			progress,
			this.isBg
				? currentValue.map(
						(curVal, idx) => curVal + (value[idx] - curVal) * easingProgress
				  )
				: currentValue + (value - currentValue) * easingProgress,
		];
	}

	// setValue() 메서드 : 계산된 값을 실제로 요소에 적용합니다. scroll: 스크롤 위치를 설정합니다. percent: 퍼센트 값을 설정합니다.
	// color: RGB 색상 값을 설정합니다. basic: 픽셀 단위 값을 설정합니다.
	setValue(key, result, type) {
		if (type === "percent") this.selector.style[key] = result + "%";
		else if (type === "color")
			this.selector.style[key] = `rgb(${result[0]},${result[1]},${result[2]})`;
		else if (key === "opacity") this.selector.style[key] = result;
		else if (key === "scroll") this.selector.scroll(0, result);
		else this.selector.style[key] = result + "px";
	}

	// 색상 처리 유틸리티 : colorToArray()는 "rgb(255, 0, 0)" 형식의 문자열을 [255, 0, 0] 형식의 배열로 변환합니다.
	colorToArray(strColor) {
		return strColor.match(/\d+/g).map(Number);
	}

	// hexToRgb()는 16진수 색상 코드를 RGB 배열로 변환합니다. 예를 들어, "#ff0000"은 [255, 0, 0]으로 변환됩니다.
	hexToRgb(hexColor) {
		const hex = hexColor.replace("#", "");
		const rgb =
			hex.length === 3 ? hex.match(/a-f\d/gi) : hex.match(/[a-f\d]{2}/gi);

		return rgb.map((el) => {
			if (el.length === 1) el = el + el;
			return parseInt(el, 16);
		});
	}
}
