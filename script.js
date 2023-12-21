document.getElementById("popup").classList.add("hidden");

var color0 = "#000";
var color1 = "#FFF";
var showGrid = true;

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function convertToPixels() {
    color0 = document.getElementById("color0").value;
    color1 = document.getElementById("color1").value;
    var binaryInput = document.getElementById("binaryInput").value;
    var lines = binaryInput.split('\n').filter(line => line.trim() !== '');
    var canvas = document.getElementById("pixelCanvas");
    var ctx = canvas.getContext("2d");
    var canvasWidth = lines.reduce((max, line) => Math.max(max, line.length), 0) * 40;
    var canvasHeight = lines.length * 40;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var pixelSize = Math.min(canvasWidth / (lines.reduce((max, line) => Math.max(max, line.length), 0) * 4), canvasHeight / (lines.length * 4));
    ctx.imageSmoothingEnabled = false;
    for (var i = 0; i < lines.length; i++) {
        var binaryValues = lines[i].replace(/\s+/g, '').split('');
        for (var j = 0; j < binaryValues.length; j++) {
            var binaryValue = binaryValues[j];
            var pixelColor;
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
                ctx.strokeStyle = "red";
                ctx.lineWidth = 1;
                ctx.strokeRect(j * pixelSize * 4, i * pixelSize * 4, pixelSize * 4, pixelSize * 4);
            }
        }
    }
}

document.getElementById("binaryInput").addEventListener("keydown", function(event) {
    var isNotMobile = window.innerWidth > 600;
    if (event.key === "Enter" && event.shiftKey) {
        var cursorPos = this.selectionStart;
        var textBefore = this.value.substring(0, cursorPos);
        var textAfter = this.value.substring(cursorPos);
        this.value = textBefore + "\n" + textAfter;
        this.selectionStart = cursorPos + 1;
        this.selectionEnd = cursorPos + 1;
        event.preventDefault();
    } else if (event.key === "Enter" && isNotMobile) {
        convertToPixels();
        event.preventDefault();
    }
});

document.getElementById("convertButton").addEventListener("click", convertToPixels);

document.getElementById("toggleGrid").addEventListener("click", function() {
    showGrid = !showGrid;
    convertToPixels();
});

document.getElementById("toggleTheme").addEventListener("click", function() {
    this.textContent = document.body.classList.contains("dark-mode") ? "🌙" : "☀️";
    document.body.classList.toggle("dark-mode");
});

document.getElementById("helpButton").addEventListener("click", function() {
    document.getElementById("popup").classList.remove("hidden");
});

document.getElementById("closeButton").addEventListener("click", hidePopup);

document.getElementById("popup").addEventListener("click", function(event) {
    if (event.target === this) {
        hidePopup();
    }
});

function hidePopup() {
    document.getElementById("popup").classList.add("hidden");
}

document.getElementById("clearButton").addEventListener("click", function() {
    document.getElementById("binaryInput").value = '';
    var canvas = document.getElementById("pixelCanvas");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

document.getElementById("color0").addEventListener("input", convertToPixels);
document.getElementById("color1").addEventListener("input", convertToPixels);

document.getElementById("year").textContent = new Date().getFullYear();
