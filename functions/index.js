const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

const transport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'guardianvecinal@gmail.com',
        pass: 'Caracoles28'
    }
});

const db = admin.firestore();

//En cuanto se creee una alerta sera enviado un correo a los vecinos
exports.AlertEmail = functions.firestore.document('alerts/{id}').onCreate((snap, context) => {
    const email = snap.data().email;
    const name = snap.data().name;
    const direction = snap.data().direction;
    const phone = snap.data().phone;
    return allContacts(email, name, direction, phone); 
    
});


async function allContacts(email, name, direction, phone){
    const nameA = name;
    const directionA = direction;
    const phoneA = phone;
    let emails = [];
    try {
        const query = db.collection('vecinos');
        const querySnapshot = await query.get();
        const docs = querySnapshot.docs;
        let i = 0;
         docs.map((doc) => {
            if (doc.data().email !== email) {
                emails[i] = doc.data().email;
                i++;
            }
        });
         return sendAlertEmail(emails, nameA, directionA, phoneA);
        
    } catch (error) {
        return console.log(error);
    }
}

function sendAlertEmail(emails, name, direction, phone) {
    console.log("este es el arreglo: ", emails)
    return transport.sendMail({
        to: emails,
        subject: 'Alerta activada ',
        html: `
        <h1> ${name} necesita ayuda!<h1>
        <p> La alerta fue activada por ${name} que vive en ${direction} y su celular ${phone}.</p>
        `
    })
}

