# POLLING APPLICATION FRONTEND

**Studente:** Andrea Filipponi  
**Project type:** Front-end demo client  
**Framework / Stack:** HTML, CSS, JavaScript  
**Back-end API repository:** [https://github.com/andreafilipponi04/Polling-Application-API.git](https://github.com/andreafilipponi04/Polling-Application-API.git) 

## Descrizione

Questo progetto è un front-end dimostrativo separato per la Polling Application API sviluppata con Django REST Framework.  
Il client consuma gli endpoint esposti dal back-end per permettere il login, la registrazione, la visualizzazione dei sondaggi, il voto, la consultazione dei risultati e la lettura del profilo utente.

L’obiettivo del progetto è fornire una dimostrazione pratica e immediata del funzionamento della REST API tramite un’interfaccia grafica semplice e leggera.  
Il front-end è separato dalla repository del back-end per mantenere distinta la parte client dalla parte server.

## Funzionalità principali

- Connessione rapida all’API locale o al deployment online.
- Login utente tramite autenticazione JWT.
- Registrazione di un nuovo account.
- Visualizzazione della lista dei sondaggi.
- Ricerca, filtri e ordinamento dei sondaggi.
- Visualizzazione del dettaglio di un sondaggio.
- Visualizzazione dei risultati con numero voti e percentuali.
- Invio di un voto per un sondaggio attivo.
- Visualizzazione del profilo dell’utente autenticato.
- Visualizzazione dei sondaggi già votati.
- Creazione di sondaggi e aggiunta di scelte, se prevista dalla UI abilitata.

## Collegamento con il back-end

Il front-end utilizza la REST API disponibile ai seguenti indirizzi:

- Locale: `http://127.0.0.1:8000/`
- Online: `https://polling-application-api.onrender.com/`

Per il corretto funzionamento online, il back-end deve essere raggiungibile pubblicamente e accettare richieste cross-origin dal client.  
Nel progetto API questo collegamento è supportato dalla configurazione CORS già presente.

## Avvio del progetto

Se il front-end è statico, è sufficiente aprire il file HTML oppure pubblicarlo con un hosting statico.  
Per il test completo:

1. Avviare o rendere disponibile il back-end API.
2. Aprire il front-end.
3. Impostare come base URL l’indirizzo locale oppure quello deployato.
4. Eseguire login o registrazione.
5. Testare lista sondaggi, dettaglio, voto e profilo.

## Note

Questo progetto è pensato come client demo separato e non sostituisce la documentazione tecnica del back-end.  
La logica applicativa, i permessi, le validazioni e la persistenza dei dati restano interamente gestiti dalla REST API.
