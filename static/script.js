let hot; // Variable para almacenar la instancia de Handsontable
let phoneNumbers = []; // Array para almacenar los números de teléfono

document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Usuario registrado exitosamente');
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
});

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Inicio de sesión exitoso');
            document.getElementById('login').style.display = 'none';
            document.getElementById('documentos').style.display = 'block';
        } else {
            alert('Credenciales incorrectas');
        }
    })
    .catch(error => console.error('Error:', error));
});
// document.getElementById('registerForm').addEventListener('submit', function(event) {
//     event.preventDefault();
//     const username = document.getElementById('regUsername').value;
//     const password = document.getElementById('regPassword').value;

//     fetch('/api/register', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ username, password })
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.status === 'success') {
//             alert('Usuario registrado exitosamente');
//         } else {
//             alert('Error: ' + data.message);
//         }
//     })
//     .catch(error => console.error('Error:', error));
// });
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Mostrar los datos en Handsontable
            const container = document.getElementById('fileDisplay');
            hot = new Handsontable(container, {
                data: jsonData,
                rowHeaders: true,
                colHeaders: true,
                contextMenu: true,
                licenseKey: 'non-commercial-and-evaluation' // Licencia para uso no comercial
            });

            // Llenar el elemento de selección con los nombres de las columnas
            const colHeaders = hot.getColHeader();
            const columnSelect = document.getElementById('columnSelect');
            columnSelect.innerHTML = ''; // Limpiar opciones anteriores
            colHeaders.forEach((header, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = header;
                columnSelect.appendChild(option);
            });

            // Mostrar el selector de columnas, botón de confirmación y otros componentes
            columnSelect.style.display = 'block';
            document.getElementById('confirmColumnButton').style.display = 'block';
            document.getElementById('clearFileButton').style.display = 'block';
            document.getElementById('countryCode').style.display = 'block';
            document.getElementById('addCountryCodeButton').style.display = 'block';
        };
        reader.readAsArrayBuffer(file);
    }
});

document.getElementById('confirmColumnButton').addEventListener('click', function() {
    const selectedColumnIndex = document.getElementById('columnSelect').value;
    phoneNumbers = hot.getDataAtCol(selectedColumnIndex).filter(Boolean); // Filtrar valores no vacíos
    document.getElementById('phoneNumbersDisplay').textContent = `Números cargados: ${phoneNumbers.join(', ')}`;
    alert(`Se han leído ${phoneNumbers.length} números de teléfono.`);
    document.getElementById('whatsapp').style.display = 'block';
});

document.getElementById('clearFileButton').addEventListener('click', function() {
    document.getElementById('fileInput').value = ''; // Reinicia la entrada de archivo
    document.getElementById('fileDisplay').innerHTML = ''; // Borra la tabla
    document.getElementById('phoneNumbersDisplay').textContent = ''; // Borra el texto mostrado
    document.getElementById('progressDisplay').innerHTML = ''; // Borra los mensajes de progreso
    phoneNumbers = [];
    hot = null;
    alert('Archivo y configuración reiniciados.');
});

document.getElementById('addCountryCodeButton').addEventListener('click', function() {
    const countryCode = document.getElementById('countryCode').value;
    if (countryCode) {
        phoneNumbers = phoneNumbers.map(number => `${countryCode}${number}`);
        document.getElementById('phoneNumbersDisplay').textContent = `Números con código de país: ${phoneNumbers.join(', ')}`;
    } else {
        alert('Por favor, ingresa un código de país válido.');
    }
});
// document.getElementById('loginForm').addEventListener('submit', function(event) {
//     event.preventDefault();
//     const username = document.getElementById('username').value;
//     const password = document.getElementById('password').value;

//     fetch('/api/login', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ username, password })
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.status === 'success') {
//             alert('Inicio de sesión exitoso');
//             document.getElementById('login').style.display = 'none';
//             document.getElementById('documentos').style.display = 'block';
//         } else {
//             alert('Credenciales incorrectas');
//         }
//     })
//     .catch(error => console.error('Error:', error));
// });<i class="fa fa-hourglass" aria-hidden="true"></i>

document.getElementById('sendMessagesButton').addEventListener('click', function() {
    const message = document.getElementById('message').value;
    const progressDisplay = document.getElementById('progressDisplay');
    progressDisplay.innerHTML = ''; // Limpiar progreso anterior

    if (phoneNumbers.length > 0) {
        phoneNumbers.forEach((phoneNumber, index) => {
            setTimeout(() => {
                fetch('/api/send_message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ phone_number: phoneNumber, message: message })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        progressDisplay.innerHTML += `<p>Mensaje enviado a ${phoneNumber}</p>`;
                    } else {
                        progressDisplay.innerHTML += `<p>Error al enviar el mensaje a ${phoneNumber}: ${data.message}</p>`;
                    }
                })
                .catch(error => {
                    progressDisplay.innerHTML += `<p>Error al enviar el mensaje a ${phoneNumber}: ${error.message}</p>`;
                });
            }, index * 2000); // Retraso de 2 segundos entre mensajes
        });
        alert('Proceso de envío iniciado.');
    } else {
        alert('No hay números de teléfono para enviar mensajes.');
    }
});