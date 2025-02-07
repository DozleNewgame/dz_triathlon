const sheetId = "1UpoX3qdm31_t854iFLHvmYBbmRsee3N5rf6nwyPsLZ0"; // スプレッドシートID
const apiKey = "AIzaSyAsjZKdggyn77PJwj5-l-Lh1ef5nm-BhAo"; // APIキー

const updateInterval = 5000; // 5秒ごとに更新
let intervalId = null; // setIntervalのID

async function fetchDataFromSpreadsheet() {
    if (document.visibilityState !== "visible") {
        return; // シーンが非表示なら実行しない
    }

    const sheetName = "マイクラトライアスロン記入用";

    try {
        const imageUrl = await fetchCellValue(`${sheetName}!D2`);
        if (imageUrl) updateImage(imageUrl);

        const statusValues = await fetchRangeValues(`${sheetName}!C4:C6`);
        toggleElement(".tetsusen", statusValues[0]);
        toggleElement(".hot", statusValues[1]);
        toggleElement(".enderdragon", statusValues[2]);

        const timeValues = await fetchRangeValues(`${sheetName}!E4:E6`);
        updateTimeContent(timeValues);
    } catch (error) {
        console.error("スプレッドシートのデータ取得に失敗しました:", error);
    }
}

// **指定範囲の値を取得**
async function fetchRangeValues(cellRange) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${cellRange}?key=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.values ? data.values.flat() : [];
    } catch (error) {
        console.error(`データ取得エラー (${cellRange}):`, error);
        return [];
    }
}

// **単一セルの値を取得**
async function fetchCellValue(cell) {
    const values = await fetchRangeValues(cell);
    return values.length > 0 ? values[0] : null;
}

// **.try クラスに画像をセット**
function updateImage(imageUrl) {
    document.querySelectorAll(".try").forEach(container => {
        container.innerHTML = `<img src="${imageUrl}" alt="スプレッドシート画像" style="max-width:100%; height:auto;">`;
    });
}

// **指定クラスの表示・非表示を制御**
function toggleElement(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
        element.style.display = (value === "TRUE") ? "block" : "none";
    }
}

// **`.time` クラスにタイムをセット**
function updateTimeContent(timeValues) {
    const timeContainers = document.querySelectorAll(".time");
    timeContainers.forEach((container, index) => {
        if (timeValues[index]) {
            container.textContent = timeValues[index];
        }
    });
}

// **データ取得を開始**
function startFetchingData() {
    if (!intervalId) {
        fetchDataFromSpreadsheet();
        intervalId = setInterval(fetchDataFromSpreadsheet, updateInterval);
    }
}

// **データ取得を停止**
function stopFetchingData() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

// **OBSのシーン表示・非表示を監視**
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        startFetchingData(); // シーンが表示されたらデータ取得開始
    } else {
        stopFetchingData(); // シーンが非表示ならデータ取得停止
    }
});

// **初回実行**
startFetchingData();
