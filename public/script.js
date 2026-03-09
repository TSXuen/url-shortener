async function shorten(){

const url = document.getElementById("urlInput").value
const custom = document.getElementById("customInput").value

const res = await fetch("/shorten",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
url:url,
custom:custom
})

})

const data = await res.json()

if(data.error){
alert(data.error)
return
}

document.getElementById("result").innerHTML =

`
<div style="display:flex;gap:10px">

<a href="${data.shortUrl}" target="_blank">
${data.shortUrl}
</a>

<button onclick="copyLink('${data.shortUrl}')">
Copy
</button>

</div>
`

document.getElementById("qrBox").innerHTML =

`
<p>QR Code</p>
<img src="${data.qrCode}" width="150">
`

loadUrls()

}

function copyLink(link){

navigator.clipboard.writeText(link)

alert("Copied!")

}

async function loadUrls(){

const res = await fetch("/urls")

const data = await res.json()

const table = document.getElementById("urlTable")

table.innerHTML = ""

for(const code in data){

const row = `
<tr>

<td>
<a href="/${code}" target="_blank">
${code}
</a>
</td>

<td>${data[code].longUrl}</td>

<td>${data[code].clicks}</td>

<td>
<button class="delete" onclick="deleteUrl('${code}')">
Delete
</button>
</td>

</tr>
`

table.innerHTML += row

}

const sorted = Object.entries(data)
.sort((a,b)=>b[1].clicks - a[1].clicks)
.slice(0,5)

const top = document.getElementById("topLinks")

top.innerHTML=""

sorted.forEach(item=>{

top.innerHTML +=
`
<li>
${item[0]} - ${item[1].clicks} clicks
</li>
`

})

}

async function deleteUrl(code){

await fetch("/delete/"+code,{
method:"DELETE"
})

loadUrls()

}

loadUrls()