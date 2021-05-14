const baseURL = 'http://localhost:8081';

let doctors
let doctorComp = {}

const attachEventHandlers = async() => {
    document.querySelectorAll('#doctors a').forEach(a => {
        fetch(`${baseURL}/doctors/${a.dataset.id}/companions`)
        .then(response => response.json())
        .then(companions => {
            html = ``
            companions.forEach(com => {
                html += `
                    <div>
                    <ul id="companions" style="white-space:nowrap">
                        <img src="${com.image_url}" width="50" height="60" style="display:inline;"/>
                        <h2 style="display:inline;">${com.name}</h2>
                    </ul>
                    </div>
                    <br>
                `
            })

            doctorComp[a.dataset.id] = html;
        });
        a.onclick = showDetail;
    });
    document.querySelector('#addDoctor').onclick = addDoctor;
};
const getDoctors = async() => {
    fetch(`${baseURL}/doctors`)
        .then(response => response.json())
        .then(data => {
            doctors = data;
            const listItems = data.map(item => `
                <li>
                    <a id="${item._id}" href='#' align="left" data-id="${item._id}" data-ordering="${item.ordering}">${item.name}</a>
                </li>
                `);
                var items = `<ol>` + listItems.join('') + `</ol>`;
                document.getElementById('doctors').innerHTML = `
                    ${items}
                    <ul>
                    <button id="addDoctor" class="btn" data-id="test">Add Doctor</button>
                    </ul>
                `
        })
        .then(attachEventHandlers);

}


const addDoctor = () => {
    document.getElementById('companions').innerHTML = ``;
    document.getElementById('doctor').innerHTML = `
        <section id='form'>
        <header class="error" id="error"></header>
        <form id='docForm'>
        <!-- Name -->

        <label for="name">Name</label>
        <br>
        <input type="text" id="name" >
        <br><br>
        <!-- Seasons -->
        <label for="seasons">Seasons</label>
        <br>
        <input type="text" id="seasons" >
        <br><br>
        <!-- Ordering -->
        <label for="ordering">Ordering</label>
        <br>
        <input type="number" id="ordering" >
        <br><br>
        <!-- Image -->
        <label for="image_url">Image</label>
        <br>
        <input type="url" id="image_url" >
        <br>
        <!-- Buttons -->
        <br>
        <button type="button" class="btn btn-main" id="create">Save</button>
        <button type="button" class="btn" id="cancel">Cancel</button>
        </form>
        </section>
    `;
    document.getElementById('create').onclick = validateForm;
    document.getElementById('cancel').onclick = cancelForm;
}
const cancelForm = () => {
    document.getElementById('doctor').innerHTML = ``;
}
const validateForm = () => {
    var flag=true;
    form = document.forms["docForm"];
    if (!form['name'].value || !form['seasons'].value || !form['ordering'].value || !form['image_url'].value){
        errorMessage("All fields are required.")
        return;
    }

    var seasons = form['seasons'].value.split(',');
    seasons.forEach(elem => {
        if (isNaN(elem)){
            errorMessage("Please make sure the values in seasons are valid and separated by a comma.");
            flag=false;
            return;
        }
    })

    if (!flag){
        return;
    }

    var vals = {
        name : form['name'].value,
        seasons : form['seasons'].value,
        ordering : form['ordering'].value,
        image_url : form['image_url'].value
    };

    fetch(`${baseURL}/doctors`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(vals)})
        .then(response => response.json())
        .then(data => {
            getDoctors();
            document.querySelector('#doctor').innerHTML = `
                <div>
                <h2>
                    ${data.name}
                    <a id="edit" data-id="${data._id}" class="edit" href=#> Edit </a>
                    <br>
                    <a id="delete" data-id="${data._id}" class="edit" href=#> Delete </a>
                </h2>
                <img src="${data.image_url}" width="500" height="700"/>
                <p>Seasons: ${data.seasons}</p>
                <br>
                </div>
            `;
            document.querySelector('#companions').innerHTML = doctorComp[data._id];
            document.getElementById('edit').onclick = editDoctor;
            document.getElementById('delete').onclick = deleteDoctor;
        });
}

const validateFormEdit = ev => {
    const id = ev.currentTarget.dataset.id;
    var flag=true;
    form = document.forms["docForm"];

    var seasons = form['seasons'].value.split(',');
    seasons.forEach(elem => {
        if (isNaN(elem)){
            errorMessage("Please make sure the values in seasons are valid and separated by a comma.");
            flag = false;
            return;
        }
    })
    if (!flag){
        return;
    }
    var vals = {}
    if (form['name'].value){
        vals['name'] = form['name'].value;
    }
    if (form['seasons'].value){
        vals['seasons'] = seasons;
    }
    if (form['ordering'].value){
        vals['ordering'] = form['ordering'].value;
    }
    if (form['image_url'].value){
        vals['image_url'] = form['image_url'].value;
    }

    fetch(`${baseURL}/doctors/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(vals)})
        .then(response => response.json())
        .then(data => {
            getDoctors();
            document.querySelector('#doctor').innerHTML = `
                <div>
                <h2>
                    ${data.name}
                    <a id="edit" data-id="${data._id}" class="edit" href=#> Edit </a>
                    <br>
                    <a id="delete" data-id="${data._id}" class="edit" href=#> Delete </a>
                </h2>
                <img src="${data.image_url}" width="500" height="700"/>
                <p>Seasons: ${data.seasons}</p>
                <br>
                </div>
            `;
            document.querySelector('#companions').innerHTML = doctorComp[data._id];
            console.log(document.getElementById('edit'));
            document.getElementById('edit').onclick = editDoctor;
            document.getElementById('delete').onclick = deleteDoctor;
        });
}

const deleteDoctor = ev => {
    const id = ev.currentTarget.dataset.id;
    const doctor = doctors.filter(doctor => doctor._id === id)[0];
    if(window.confirm("Do you really want to delete this doctor?")){
        fetch(`${baseURL}/doctors/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }})
            .then(e => {
                getDoctors()
                document.getElementById('doctor').innerHTML = ``;
                document.getElementById('companions').innerHTML = ``;
            });
    }

}

const errorMessage = (message) =>{
    errorHtml = document.getElementById("error");
    errorHtml.innerHTML = `${message}`;
    errorHtml.style.display = "block";
}

const showDetail = ev => {
    const id = ev.currentTarget.dataset.id;

    const doctor = doctors.filter(doctor => doctor._id === id)[0];
    console.log(doctor);

    document.querySelector('#doctor').innerHTML = `
        <div>
        <h2>
            ${doctor.name}
            <a id="edit" data-id="${doctor._id}" class="edit" href=#> Edit </a>
            <br>
            <a id="delete" data-id="${doctor._id}" class="edit" href=#> Delete </a>
        </h2>
        <img src="${doctor.image_url}" width="500" height="700"/>
        <p>Seasons: ${doctor.seasons}</p>
        <br>
        </div>
    `;
    document.querySelector('#companions').innerHTML = doctorComp[doctor._id];
    document.getElementById('edit').onclick = editDoctor;
    document.getElementById('delete').onclick = deleteDoctor;
}

const editDoctor = ev => {
    const id = ev.currentTarget.dataset.id;
    console.log(id);
    const doctor = doctors.filter(doctor => doctor._id === id)[0];
    var temp = document.getElementById('doctor').innerHTML;

    document.getElementById('doctor').innerHTML = `
        <section id='form'>
        <header class="error" id="error"></header>
        <form id='docForm'>
        <!-- Name -->

        <label for="name">Name</label>
        <br>
        <input type="text" id="name" value="${doctor.name}" >
        <br><br>
        <!-- Seasons -->
        <label for="seasons">Seasons</label>
        <br>
        <input type="text" id="seasons" value="${doctor.seasons}">
        <br><br>
        <!-- Ordering -->
        <label for="ordering">Ordering</label>
        <br>
        <input type="number" id="ordering" value="${doctor.ordering}" >
        <br><br>
        <!-- Image -->
        <label for="image_url">Image</label>
        <br>
        <input type="url" id="image_url" value="${doctor.image_url}" >
        <br>
        <!-- Buttons -->
        <br>
        <button type="button" class="btn btn-main" id="create" data-id="${id}">Save</button>
        <button type="button" class="btn" id="cancel">Cancel</button>
        </form>
        </section>
        `
        document.getElementById('create').onclick = validateFormEdit;
        document.getElementById('cancel').onclick = function cancel(){
            document.getElementById('doctor').innerHTML = temp;
            document.getElementById('edit').onclick = editDoctor;
            document.getElementById('delete').onclick = deleteDoctor;
        };
}
const initResetButton = () => {
    // if you want to reset your DB data, click this button:
    document.querySelector('#reset').onclick = ev => {
        fetch(`${baseURL}/reset/`)
            .then(response => response.json())
            .then(data => {
                console.log('reset:', data);
                getDoctors();
                document.querySelector('#doctor').innerHTML = ``;
                document.querySelector('#companions').innerHTML = ``;

            });
    };
};

// invoke this function when the page loads:
initResetButton();
getDoctors();
