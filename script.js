let translations;
let currentLanguage = localStorage.getItem("language") || "en";

function updateLanguage(lang) {
  if (!translations) return;

  const translatedElements = document.querySelectorAll('[data-translate]');
  const binaryInput = document.getElementById('binaryInput');

  translatedElements.forEach((element) => {
    const key = element.dataset.translate;
    if (key.startsWith('helpPopup.')) {
      const popupKey = key.slice(9);
      element.innerHTML = translations[lang].helpPopup[popupKey];
    } else if (element === binaryInput) {
      binaryInput.placeholder = translations[lang][key];
    } else {
      element.innerHTML = translations[lang][key].replace(/\\n/g, '<br>');
    }
  });

  document.getElementById('downloadButton').title = translations[lang]['downloadButtonTitle'];
  document.getElementById('toggleGrid').title = translations[lang]['toggleGridTitle'];
  document.getElementById('pixelsToBinaryButton').title = translations[lang]['pixelsToBinaryButtonTitle'];
  document.getElementById('helpButton').title = translations[lang]['helpButtonTitle'];
  document.getElementById('toggleTheme').title = translations[lang]['toggleThemeTitle'];
  document.getElementById('languageToggle').title = translations[lang]['languagetoggletitle'];

  localStorage.setItem('language', lang);
  document.body.setAttribute('lang', lang);
}

const maxCharacters = 50000;
document.getElementById("convertButton").addEventListener("click", convertToPixels);

function getThemeEmoji(isDarkMode, currentLanguage) {
  const darkModeEmoji = currentLanguage === 'en' ? '🌙' : '☀️';
  const lightModeEmoji = currentLanguage === 'en' ? '☀️' : '🌙';
  return isDarkMode ? darkModeEmoji : lightModeEmoji;
}

window.addEventListener('load', function () {
  fetch('translations.json')
    .then((response) => response.json())
    .then((data) => {
      translations = data;
      updateLanguage(currentLanguage);

      const isDarkMode = localStorage.getItem('isDarkMode') === 'true';
      const themeEmoji = localStorage.getItem('themeEmoji') || (isDarkMode ? '☀️' : '🌙');

      if (isDarkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }

      document.getElementById('toggleTheme').textContent = themeEmoji;
    });

  const languageToggle = document.getElementById('languageToggle');
  const flagIcon = languageToggle.querySelector('.flag-icon img');
  flagIcon.src = currentLanguage === 'en' ? 'assets/flag-il.svg' : 'assets/flag-us.svg';
});

function toggleTheme() {
  const isDarkMode = document.body.classList.contains('dark-mode');
  const nextThemeEmoji = isDarkMode ? '🌙' : '☀️';

  document.body.classList.toggle('dark-mode');
  localStorage.setItem('isDarkMode', !isDarkMode);
  localStorage.setItem('themeEmoji', nextThemeEmoji);

  document.getElementById('toggleTheme').textContent = nextThemeEmoji;
}

const languageToggle = document.getElementById("languageToggle");
const flagIcon = languageToggle.querySelector(".flag-icon img");

languageToggle.addEventListener("click", toggleLanguage);

function toggleLanguage() {
  currentLanguage = localStorage.getItem("language") || "en";
  const newLanguage = currentLanguage === "en" ? "he" : "en";
  updateLanguage(newLanguage);
  flagIcon.src = newLanguage === "en" ? "assets/flag-il.svg" : "assets/flag-us.svg";
}

window.addEventListener("DOMContentLoaded", function () {
  const convertButton = document.getElementById("convertButton");
  const toggleGridButton = document.getElementById("toggleGrid");
  const color0Input = document.getElementById("color0");
  const color1Input = document.getElementById("color1");

  convertButton.addEventListener("click", convertToPixels);

  toggleGridButton.addEventListener("click", function () {
    showGrid = !showGrid;
    convertToPixels();
  });

  color0Input.addEventListener("input", convertToPixels);
  color1Input.addEventListener("input", convertToPixels);
});

window.addEventListener('load', checkWindowWidth);
window.addEventListener('resize', checkWindowWidth);

function checkWindowWidth() {
  const windowWidth = window.innerWidth;
  const logoCanvas = document.getElementById('canvaslogo');
  const logoImg = document.getElementById('logoImg');

  if (windowWidth < 440) {
    logoCanvas.style.display = 'none';
    logoImg.style.display = 'block';
  } else {
    logoCanvas.style.display = 'block';
    logoImg.style.display = 'none';
  }
}

document.getElementById("toggleTheme").addEventListener("click", toggleTheme);

let color0 = localStorage.getItem("color0") || "#000000";
let color1 = localStorage.getItem("color1") || "#FFFFFF";

let showGrid = true;

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function convertToPixels() {
  color0 = document.getElementById("color0").value;
  color1 = document.getElementById("color1").value;
  const binaryInput = document.getElementById("binaryInput").value;
  const totalCharacters = binaryInput.length;
  const lines = binaryInput.split("\n").filter((line) => line.trim() !== "");
  const canvas = document.getElementById("pixelCanvas");
  const ctx = canvas.getContext("2d");
  const canvasWidth = lines.reduce(
    (max, line) => Math.max(max, line.replace(/\s/g, "").length),
    0
  ) * 40;
  const canvasHeight = lines.length * 40;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const pixelSize = Math.min(
    canvasWidth / (lines.reduce((max, line) => Math.max(max, line.replace(/\s/g, "").length), 0) * 4),
    canvasHeight / (lines.length * 4)
  );
  ctx.imageSmoothingEnabled = false;
  if (JSON.stringify(lines) === JSON.stringify(secretCombination)) {
    showSecretPopup();
    return;
  }

  if (totalCharacters > maxCharacters) {
    const alertMessage = translations[currentLanguage].maxCharactersAlert.replace('{totalCharacters}', totalCharacters).replace('{maxCharacters}', maxCharacters);
    alert(alertMessage);
    return;
  }

  for (let i = 0; i < lines.length; i++) {
    const binaryValues = lines[i].replace(/\s+/g, "").split("");
    for (let j = 0; j < binaryValues.length; j++) {
      const binaryValue = binaryValues[j];
      let pixelColor;
      if (binaryValue === "0") {
        pixelColor = color0;
      } else if (binaryValue === "1") {
        pixelColor = color1;
      } else {
        pixelColor = getRandomColor();
      }
      ctx.fillStyle = pixelColor;
      ctx.fillRect(j * pixelSize * 4, i * pixelSize * 4, pixelSize * 4, pixelSize * 4);
      if (showGrid) {
        const invertedGridColor = getInvertedColor(pixelColor);
        ctx.strokeStyle = invertedGridColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(j * pixelSize * 4, i * pixelSize * 4, pixelSize * 4, pixelSize * 4);
      }
    }
  }
}

function getInvertedColor(hexColor) {
  const hexWithoutHash = hexColor.slice(1);
  const r = parseInt(hexWithoutHash.slice(0, 2), 16);
  const g = parseInt(hexWithoutHash.slice(2, 4), 16);
  const b = parseInt(hexWithoutHash.slice(4, 6), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  const invertedRGB = brightness > 128 ? '000000' : 'ffffff';

  return `#${invertedRGB}`;
}

document.getElementById("binaryInput").addEventListener("keydown", function (event) {
  const isNotMobile = window.innerWidth > 600;
  if (event.key === "Enter" && event.shiftKey) {
    const cursorPos = this.selectionStart;
    const textBefore = this.value.substring(0, cursorPos);
    const textAfter = this.value.substring(cursorPos);
    this.value = textBefore + "\n" + textAfter;
    this.selectionStart = cursorPos + 1;
    this.selectionEnd = cursorPos + 1;
    event.preventDefault();
  } else if (event.key === "Enter" && isNotMobile) {
    convertToPixels();
    event.preventDefault();
  }
});

const popup = document.getElementById('popup');
const popupContent = document.getElementById('popupContent');

window.addEventListener('click', function (event) {
  if (event.target === popup) {
    popup.classList.add('hidden');
  }
});

const pixelsToBinaryPopup = document.getElementById('pixelsToBinaryPopup');
const pixelsToBinaryPopupContent = document.getElementById('pixelsToBinaryPopupContent');

window.addEventListener('click', function (event) {
  if (event.target === pixelsToBinaryPopup) {
    pixelsToBinaryPopup.classList.add('hidden');
  }
});



const secretCombination = [
  '00000',
  '01110',
  '00010',
  '00100',
  '00000',
  '00100',
  '00000'
];

document.getElementById('convertButton').addEventListener('click', () => {
  const binaryInput = document.getElementById('binaryInput').value;
  const lines = binaryInput.split('\n').map(line => line.trim());

  if (JSON.stringify(lines) === JSON.stringify(secretCombination)) {
    showSecretPopup();
  } else {
    hideSecretPopup();
    convertToPixels();
  }
});

function hideSecretPopup() {
  const secretPopup = document.getElementById('secretPopup');
  secretPopup.classList.add('hidden');
}

function showSecretPopup() {
  const secretPopup = document.getElementById('secretPopup');
  secretPopup.classList.remove('hidden');
}

window.addEventListener('click', function (event) {
  const secretPopup = document.getElementById('secretPopup');
  const secretPopupContent = document.getElementById('secretPopupContent');

  if (event.target === secretPopup) {
    secretPopup.classList.add('hidden');
  }
});

document.getElementById('closeSecretPopup').addEventListener('click', () => {
  const secretPopup = document.getElementById('secretPopup');
  secretPopup.classList.add('hidden');
});

document.getElementById('description').textContent = platform.description;



window.onload = function () {
  const pixelsToBinaryButton = document.getElementById("pixelsToBinaryButton");
  const pixelsToBinaryPopup = document.getElementById("pixelsToBinaryPopup");
  const closePixelsToBinaryPopup = document.getElementById("closePixelsToBinaryPopup");
  const imageUpload = document.getElementById("imageUpload");
  const convertImageToBinary = document.getElementById("convertImageToBinary");
  const binaryOutput = document.getElementById("binaryOutput");
  const copyBinaryToClipboard = document.getElementById("copyBinaryToClipboard");
  const sendBinaryToTextbox = document.getElementById("sendBinaryToTextbox");

  pixelsToBinaryButton.addEventListener("click", () => {
    pixelsToBinaryPopup.classList.remove("hidden");
  });

  closePixelsToBinaryPopup.addEventListener("click", () => {
    pixelsToBinaryPopup.classList.add("hidden");
  });

  imageUpload.addEventListener("change", () => {
    convertImageToBinary.disabled = false;
  });

  pixelsToBinaryPopup.classList.remove("hidden");

  pixelsToBinaryPopup.classList.add("hidden");

  convertImageToBinary.addEventListener("click", () => {
    const file = imageUpload.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const maxPixels = 50000;
        const totalPixels = img.width * img.height;

        const previewCanvas = document.getElementById("previewCanvas");
        const previewContainer = document.getElementById("previewContainer");
        const maxPreviewWidth = previewContainer.offsetWidth;
        const maxPreviewHeight = previewContainer.offsetHeight;

        if (totalPixels > maxPixels) {
          const alertMessage = translations[currentLanguage].maxPixelsAlert.replace('{totalPixels}', totalPixels).replace('{maxPixels}', maxPixels);
          alert(alertMessage);
          return;
        }

        previewCanvas.width = maxPreviewWidth;
        previewCanvas.height = maxPreviewHeight;

        const previewCtx = previewCanvas.getContext("2d");
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        previewCtx.imageSmoothingEnabled = false;

        const scalingFactorWidth = maxPreviewWidth / img.width;
        const scalingFactorHeight = maxPreviewHeight / img.height;
        const scalingFactor = Math.min(scalingFactorWidth, scalingFactorHeight);

        const scaledWidth = img.width * scalingFactor;
        const scaledHeight = img.height * scalingFactor;

        const x = (maxPreviewWidth - scaledWidth) / 2;
        const y = (maxPreviewHeight - scaledHeight) / 2;
        previewCtx.drawImage(img, x, y, scaledWidth, scaledHeight);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const [color0, color1] = getMostProminentColors(imageData);

        const binaryData = [];
        const binaryLines = [];
        let currentLine = "";

        for (let i = 0; i < imageData.data.length; i += 4) {
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];
          const pixelColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

          if (pixelColor.toLowerCase() === color0.toLowerCase()) {
            currentLine += "0";
          } else if (pixelColor.toLowerCase() === color1.toLowerCase()) {
            currentLine += "1";
          } else {
            currentLine += "?";
          }

          if (currentLine.length === canvas.width) {
            binaryLines.push(currentLine);
            currentLine = "";
          }
        }

        if (currentLine !== "") {
          binaryLines.push(currentLine);
        }

        const binaryString = binaryLines.join("\r\n");

        const binaryStringWithBreaks = binaryString.replace(/\r\n/g, "<br>");

        binaryOutput.innerHTML = binaryStringWithBreaks;

        copyBinaryToClipboard.disabled = false;
        sendBinaryToTextbox.disabled = false;

        copyBinaryToClipboard.addEventListener("click", () => {
          navigator.clipboard.writeText(binaryString);
        });

        sendBinaryToTextbox.addEventListener("click", () => {
          const textbox = document.getElementById("binaryInput");
          textbox.value = binaryString + "\n";
        });
      };
    };

    reader.readAsDataURL(file);
  });

  copyBinaryToClipboard.addEventListener("click", () => {
    const binaryString = binaryOutput.textContent;
    navigator.clipboard.writeText(binaryString);
  });

  sendBinaryToTextbox.addEventListener("click", () => {
    const binaryString = binaryOutput.textContent;
    const textbox = document.getElementById("binaryInput");
    textbox.value = binaryString + "\n";
  });
};

function getMostProminentColors(imageData) {
  const colorMap = {};
  const totalPixels = imageData.data.length / 4;

  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

    if (colorMap[hexColor]) {
      colorMap[hexColor]++;
    } else {
      colorMap[hexColor] = 1;
    }
  }

  const sortedColors = Object.entries(colorMap).sort((a, b) => b[1] - a[1]);
  const [mostProminentColor, secondMostProminentColor] = sortedColors.slice(0, 2).map(([color]) => color);

  return [mostProminentColor, secondMostProminentColor];
}

function canvasHasPixels() {
  const canvas = document.getElementById('pixelCanvas');
  const ctx = canvas.getContext('2d');

  if (canvas.width === 0 || canvas.height === 0) {
    return false;
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] !== 0) {
      return true;
    }
  }

  return false;
}

const downloadPopup = document.getElementById('downloadPopup');
const downloadPopupContent = document.getElementById('downloadPopupContent');
const closeDownloadPopup = document.getElementById('closeDownloadPopup');
const downloadScaledImage = document.getElementById('downloadScaledImage');
const downloadUnscaledImage = document.getElementById('downloadUnscaledImage');

window.addEventListener('click', function (event) {
  if (event.target === downloadPopup) {
    downloadPopup.classList.add('hidden');
  }
});

document.getElementById('downloadButton').addEventListener('click', function () {
  downloadPopup.classList.remove('hidden');
  updateImageDetails();
});

closeDownloadPopup.addEventListener('click', function () {
  downloadPopup.classList.add('hidden');
});

function updateImageDetails() {
  const canvas = document.getElementById('pixelCanvas');
  const hasPixels = canvasHasPixels();
  const scaledWidth = canvas.width;
  const scaledHeight = canvas.height;
  const unscaledWidth = Math.floor(scaledWidth / 40);
  const unscaledHeight = Math.floor(scaledHeight / 40);
  const downloadButtons = document.getElementById('downloadButtons');
  const noPixelsMessage = document.getElementById('noPixelsMessage');

  const unscaledCanvas = document.createElement('canvas');
  unscaledCanvas.width = unscaledWidth;
  unscaledCanvas.height = unscaledHeight;

  const unscaledCtx = unscaledCanvas.getContext('2d');
  const scaledCtx = canvas.getContext('2d');

  scaledCtx.willReadFrequently = true;

  downloadButtons.classList.remove('hidden');
  noPixelsMessage.classList.add('hidden');

  if (scaledWidth > 0 && scaledHeight > 0 && hasPixels) {
    const imageData = scaledCtx.getImageData(0, 0, scaledWidth, scaledHeight);
    const unscaledImageData = unscaledCtx.createImageData(unscaledWidth, unscaledHeight);

    for (let y = 0; y < unscaledHeight; y++) {
      for (let x = 0; x < unscaledWidth; x++) {
        const scaledX = x * 40;
        const scaledY = y * 40;
        const scaledIndex = (scaledY * scaledWidth + scaledX) * 4;
        const unscaledIndex = (y * unscaledWidth + x) * 4;

        unscaledImageData.data[unscaledIndex] = imageData.data[scaledIndex];
        unscaledImageData.data[unscaledIndex + 1] = imageData.data[scaledIndex + 1];
        unscaledImageData.data[unscaledIndex + 2] = imageData.data[scaledIndex + 2];
        unscaledImageData.data[unscaledIndex + 3] = imageData.data[scaledIndex + 3];
      }
    }

    unscaledCtx.putImageData(unscaledImageData, 0, 0);
    const scaledImageSize = getImageSize(canvas);
    const unscaledImageSize = getImageSize(unscaledCanvas);

    const scaledImageDimensions = document.getElementById('scaledImageDimensions');
    const scaledImageSizeElement = document.getElementById('scaledImageSize');
    const unscaledImageDimensions = document.getElementById('unscaledImageDimensions');
    const unscaledImageSizeElement = document.getElementById('unscaledImageSize');

    if (scaledImageDimensions && scaledImageSizeElement && unscaledImageDimensions && unscaledImageSizeElement) {
      scaledImageDimensions.textContent = `${scaledHeight}x${scaledWidth}`;
      scaledImageSizeElement.textContent = formatBytes(scaledImageSize);
      unscaledImageDimensions.textContent = `${unscaledHeight}x${unscaledWidth}`;
      unscaledImageSizeElement.textContent = formatBytes(unscaledImageSize);
    }
  } else if (!hasPixels) {
    downloadButtons.classList.add('hidden');
    noPixelsMessage.classList.remove('hidden');
  } else {
    downloadButtons.classList.add('hidden');
    noPixelsMessage.textContent = translations[currentLanguage].noPixelsMessage;
    noPixelsMessage.classList.remove('hidden');
  }
}

function formatBytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

downloadScaledImage.addEventListener('click', function () {
  const canvas = document.getElementById('pixelCanvas');
  const hasPixels = canvasHasPixels();

  if (!hasPixels) {
    return;
  }

  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = 'Image.png';
  link.href = dataURL;
  link.click();
  downloadPopup.classList.add('hidden');
});

function getImageSize(canvas) {
  const dataURL = canvas.toDataURL('image/png');
  const binaryString = window.atob(dataURL.split(',')[1]);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.length;
}

downloadUnscaledImage.addEventListener('click', function () {
  const canvas = document.getElementById('pixelCanvas');
  const hasPixels = canvasHasPixels();
  const scaledWidth = canvas.width;
  const scaledHeight = canvas.height;
  const unscaledWidth = Math.floor(scaledWidth / 40);
  const unscaledHeight = Math.floor(scaledHeight / 40);

  const unscaledCanvas = document.createElement('canvas');
  unscaledCanvas.width = unscaledWidth;
  unscaledCanvas.height = unscaledHeight;

  const unscaledCtx = unscaledCanvas.getContext('2d');

  const binaryInput = document.getElementById('binaryInput').value;
  const lines = binaryInput.split('\n').filter((line) => line.trim() !== '');

  const color0 = document.getElementById('color0').value;
  const color1 = document.getElementById('color1').value;

  if (!hasPixels) {
    return;
  }

  for (let y = 0; y < unscaledHeight; y++) {
    let x = 0;
    const line = lines[y] || '';
    for (let i = 0; i < line.length; i++) {
      const binaryValue = line[i];

      if (binaryValue !== ' ') {
        if (binaryValue === '0') {
          unscaledCtx.fillStyle = color0;
          unscaledCtx.fillRect(x, y, 1, 1);
        } else if (binaryValue === '1') {
          unscaledCtx.fillStyle = color1;
          unscaledCtx.fillRect(x, y, 1, 1);
        } else {
          // Handle other characters if needed
        }
        x++;
      }
    }
  }

  const unscaledDataURL = unscaledCanvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = 'UnscaledImage.png';
  link.href = unscaledDataURL;
  link.click();
  downloadPopup.classList.add('hidden');
});

function hidePopup() {
  document.getElementById("popup").classList.add("hidden");
}

document.getElementById("toggleGrid").addEventListener("click", toggleGrid);


document.getElementById("closeButton").addEventListener("click", hidePopup);

document.getElementById("helpButton").addEventListener("click", function () {
  document.getElementById("popup").classList.remove("hidden");
});

document.getElementById("year").textContent = new Date().getFullYear() + "©";

document.getElementById("toggleTheme").addEventListener("click", toggleTheme);