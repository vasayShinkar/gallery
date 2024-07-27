let highlighter = document.createElement("div");
highlighter.classList.add("highlighter")
document.body.append(highlighter)

let ondown = false
let highlighter_cords_begin = [0, 0];
let selecterImg = new Array()


document.addEventListener("mousemove", event => {
    event.preventDefault()

    let x1 = highlighter_cords_begin[0]
    let y1 = highlighter_cords_begin[1]
    let x2 = event.clientX
    let y2 = event.clientY
    if (x1 > x2) {
        [x1, x2] = [x2, x1]
    }
    if (y1 > y2) {
        [y1, y2] = [y2, y1]
    }


    highlighter.style.left = x1 + "px"
    highlighter.style.top = y1 + "px"
    highlighter.style.width = x2 - x1 + "px"
    highlighter.style.height = y2 - y1 + "px"
    highlighter.style.visibility = ondown ? 'visible' : 'hidden';

    if (ondown) {
        if (document.querySelector(".modal__setings")) document.querySelector(".modal__setings").remove()
        doSelection(x1, y1, x2, y2)
    }
})

document.querySelector(".picteres").addEventListener("mousedown", event => {
    event.preventDefault()
    highlighter_cords_begin = [event.clientX, event.clientY]
    ondown = true
})


document.addEventListener("mouseup", event => {
    event.preventDefault()
    ondown = false
})

document.querySelector(".picteres").addEventListener("contextmenu", event => {
    event.preventDefault()
    let item = event.target;
    if (document.querySelector(".modal__setings")) document.querySelector(".modal__setings").remove()
    if (!selecterImg || !selecterImg.includes(item)) return;
    let modal = document.createElement("div")
    modal.className = "modal__setings"
    modal.innerHTML = "<button onclick='downloadSelectedImg()'>download</button><button onclick='deleteSelectedImg()'>delete</button>"
    modal.style.left = event.clientX + "px"
    modal.style.top = event.clientY + "px"
    document.body.append(modal)
})


function doSelection(x1, y1, x2, y2) {
    let images = document.querySelectorAll(".picteres__images img")
    selecterImg = []

    images.forEach(img => {
        let cordsImg = img.getBoundingClientRect()
        let x_img = cordsImg.x + cordsImg.width / 2
        let y_img = cordsImg.y + cordsImg.height / 2
        if (x_img > x1 && x_img < x2 && y_img > y1 && y_img < y2) {
            img.style.boxShadow = "0 0 20px 2px rgb(233, 48, 73)"
            img.style.transform = "scale(0.9)"
            selecterImg.push(img)
        } else {
            img.style.boxShadow = "0 0 20px 0.4px #000"
            img.style.transform = "scale(1)"


        }
    });
}


function deleteSelectedImg() {
    if (!selecterImg) return;
    if (document.querySelector(".modal__setings")) document.querySelector(".modal__setings").remove()

    let arrayOfParents = new Set()
    selecterImg.forEach(elem => {
        arrayOfParents.add(elem.parentElement)
        deleteData(elem.dataset.id)
        elem.remove()
    })
    for (let elem of arrayOfParents) {
        if (elem.children.length == 0) {
            elem.parentElement.remove()
        }
    }
}

function downloadSelectedImg() {
    createZip(selecterImg)
}

document.querySelector(".panel__download").addEventListener("click", () => {

    getData(1000).then((data) => {
        createZip(Array.from(data))
    })
})

function createZip(arr) {
    let newZip = new JSZip()
    let images = newZip.folder("images")
    arr.forEach(elem => {
        let url = elem.src.replace(/^data:image\/(png|jpg);base64,/, "");
        images.file(`${elem.dataset?.id || elem.id}.gif`, url, {
            base64: true
        })
    })
    newZip.generateAsync({
            type: "blob"
        })
        .then(content => {
            saveAs(content, "images.zip")
        })

}


document.addEventListener("scroll", (event) => {
    if (document.querySelector(".modal__setings")) document.querySelector(".modal__setings").remove()

})


document.querySelector(".findInEnternet").onclick = function() {
    document.querySelector(".modal_internet").style.display = "block"
}

document.querySelector(".drawImage").onclick = function() {
    document.querySelector(".modal_draw").style.display = "block"
}

document.querySelectorAll(".modal__close").forEach(elem => {
    elem.addEventListener("click", (event) => {
        let parent = event.target.closest(".modal__images")
        parent.style.display = "none"
        if (parent.classList.contains("modal_draw")) {
            holst.clearRect(0, 0, 300, 300)
        } else if (parent.classList.contains("modal_internet")) {
            document.querySelector(".modal__images-resultFetch").innerHTML = ""
            document.querySelector(".modal__images-next").style.visibility = "hidden"
        }

    })
})

let canvasDraw = document.getElementById("modal__canvas");
var holst = canvasDraw.getContext("2d")
holst.fillStyle = "#fff"
holst.fillRect(0, 0, 300, 300)
holst.fill()
let drawDown = false
let cordsDraw = []
let rubber = false
canvasDraw.onmousedown = function(e) {
    drawDown = true
    cordsDraw = [e.offsetX, e.offsetY]
}
canvasDraw.onmouseup = function(e) {
    drawDown = false
}

function drawCircle(x, y) {
    holst.beginPath()
    holst.arc(x, y, 1, 0, Math.PI * 2)
    holst.fill()
}

function drawLine(x, y, x2, y2) {
    holst.beginPath()
    holst.moveTo(x2, y2)
    holst.lineTo(x, y)
    holst.strokeStyle = "#000"
    holst.lineWidth = "2"
    holst.stroke()
}

canvasDraw.onmousemove = function(e) {
    e.preventDefault()
    let x2 = e.offsetX
    let y2 = e.offsetY
    if (!drawDown) return;
    if (rubber) {
        holst.fillStyle = "#fff"
        holst.fillRect(x2 - 15, y2 - 15, 15, 15)
        holst.fill()
        return;
    }
    drawCircle(x2, y2)
    drawLine(x2, y2, cordsDraw[0], cordsDraw[1])
    cordsDraw[0] = x2
    cordsDraw[1] = y2
}
document.getElementById("modal__convas-save").onclick = function() {
    let url = canvasDraw.toDataURL()
    document.querySelectorAll(".modal__close")[1].click()

    saveImage(url)
}
document.getElementById("modal__convas-pen").onclick = function() {
    rubber = false
}
document.getElementById("modal__convas-rubber").onclick = function() {
    rubber = true
}



function saveImage(url) {
    let date = new Date()
    let year = date.getFullYear()
    let day = ("0" + date.getDate()).slice(-2)
    let month = ("0" + date.getMonth()).slice(-2)
    let date_format = `${day}.${month}.${year}`
    let id = (Math.random() * 100000000000000000).toString(36)


    if (!document.querySelector(`.pictures__item[data-time="${date_format}"] .picteres__images`)) {
        createPictureItem(date_format, "prepand")
    }
    let img = document.createElement("img")
    img.src = url
    img.dataset.id = id
    document.querySelector(`.pictures__item[data-time="${date_format}"] .picteres__images`).append(img)

    addData({
        src: url,
        date: date_format,
        id: id
    })
}



const keyWebPhoto = "zFG7k08CctHobEriV9YsAOXtYyUk4wGGho4xBpSWDeo"
let page = [1, null]
async function getPhotoByQuerry(input, place) {
    let fetchUrl = await fetch(`https://api.unsplash.com/search/photos?page=${page[0]}&query=${input}&client_id=${keyWebPhoto}`)
    let data = await fetchUrl.json()
    page[1] = data.total_pages
    if (page[0] <= page[1] && data.results.length == 10) {
        document.querySelector(".modal__images-next").style.visibility = "visible"
    } else {
        document.querySelector(".modal__images-next").style.visibility = "hidden"
    }
    aminationLoad(0)
    createImages(data, place)

}

function createImages(data, place) {
    if (place.innerHTML !== "") place.innerHTML = ""
    data.results.map((elem) => {
        let img = document.createElement("img")
        img.dataset.width = elem.width
        img.dataset.height = elem.height
        img.className = "modal__images-img"
        img.src = elem.urls.small
        place.append(img)
    })


}
document.querySelector(".modal__images-next").addEventListener("click", () => {
    aminationLoad(1)
    page[0]++;
    getPhotoByQuerry(document.querySelector(".modal__images-input").value, document.querySelector(".modal__images-resultFetch"))
})

let lastType = Date.now()
let timer = null

document.querySelector(".modal__images-input").addEventListener("input", (event) => {
    aminationLoad(1)

    if (Date.now() - lastType < 2000) {
        lastType = Date.now()
        clearInterval(timer)
    }
    timer = setTimeout(() => {
        aminationLoad(0)
        lastType = Date.now()
        let description = event.target.value;
        getPhotoByQuerry(description, document.querySelector(".modal__images-resultFetch"))

    }, 2000);

})

document.querySelector(".modal__images-resultFetch").addEventListener("click", (event) => {
    let item = event.target;
    if (item.tagName !== "IMG") return;
    let finalSize = [item.dataset.width / 5, item.dataset.height / 5]
    let canvas = document.createElement("canvas")
    let gtx = canvas.getContext("2d")
    canvas.width = finalSize[0]
    canvas.height = finalSize[1]
    let img = new Image()
    img.src = item.src
    img.crossOrigin = "anonymous"
    img.onload = function() {
        gtx.drawImage(img, 0, 0, finalSize[0], finalSize[1])
        let url = canvas.toDataURL()
        canvas.remove()
        saveImage(url)
    }
    document.querySelectorAll(".modal__close")[0].click()


})

function aminationLoad(status) {
    if (status) {
        if (document.querySelector(".img_loading")) return;
        document.querySelector(".modal__images-resultFetch").insertAdjacentHTML("beforebegin", "<img class='img_loading' width='50px' height='50px' src='images/loading.gif'>")
        return;
    }
    if (document.querySelector(".img_loading")) {
        document.querySelector(".img_loading").remove()

    }
}


function openBd(callback) {
    let request = indexedDB.open("images", 4)
    request.onsuccess = function() {
        callback(request)
    }

    request.onerror = function(err) {
        console.log(request.error)
    }

    request.onupgradeneeded = function() {
        console.log("создание базы")
        let store = request.result.createObjectStore("image", {
            keyPath: "id"
        })
        store.createIndex("date", "date")
    }
}

function addData(data) {
    openBd(function(request) {
        let db = request.result
        let transaction = db.transaction("image", "readwrite")
        let store = transaction.objectStore("image")
        let requestAdd = store.add(data)

        requestAdd.onsuccess = function() {
            console.log("запись добавленно")
        }
        requestAdd.onerror = function() {
            console.log("ошибка добавления базы")
            console.log(requestAdd.error)
        }
    })
}



function getData(limit) {
    return new Promise((resolve, reject) => {
        openBd(function(request) {
            let db = request.result;
            let transaction = db.transaction("image", "readwrite");
            let store = transaction.objectStore("image");
            store = store.index("date");
            let db_cursor = store.openCursor(null, "prev");
            let data = [];
            let count = 0;
            db_cursor.onsuccess = function() {
                count++;
                let cursor = db_cursor.result;
                if (count < limit && cursor) {
                    data.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(data);
                }
            };
        });
    });
}

function deleteData(id) {
    return new Promise((resolve, reject) => {
        openBd(function(request) {
            let db = request.result;
            let transaction = db.transaction("image", "readwrite");
            let store = transaction.objectStore("image");
            store.delete(id)
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    showImages(0, 6)
});

function showImages(from, to) {
    getData(to).then((data) => {
        if (data.length < to) {
            to = data.length
        }
        data.slice(from, to).map((elem) => {
            if (!document.querySelector(`.pictures__item[data-time="${elem.date}"] .picteres__images`)) {
                createPictureItem(elem.date)
            }
            let img = document.createElement("img")
            img.src = elem.src
            img.dataset.id = elem.id
            document.querySelector(`.pictures__item[data-time="${elem.date}"] .picteres__images`).append(img)
        })
    });
}
let limitTo = 5
document.body.onscroll = function() {
    if (pageYOffset > document.body.offsetHeight - document.documentElement.clientHeight - 20) {
        showImages(limitTo, limitTo + 4)
        limitTo += 4
    }


}



function createPictureItem(date, place = "append") {
    let div = document.createElement("div")
    div.className = "pictures__item"
    div.dataset.time = date;
    div.innerHTML = `<h1 class="picteres__date">${date}</h1>
                    <div class="picteres__images">
                    </div>`;
    if (place == "prepand") {
        document.querySelector(".picteres").prepend(div)
        return;
    }
    document.querySelector(".picteres").append(div)
}