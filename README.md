# 🎨 Polling Application Frontend

**Studente:** Andrea Filipponi  
**Project type:** Frontend Client  
**Repository Frontend:** [https://github.com/andreafilipponi04/Polling-Application-Frontend](https://github.com/andreafilipponi04/Polling-Application-Frontend)  
**Repository Backend:** [https://github.com/andreafilipponi04/Polling-Application-API](https://github.com/andreafilipponi04/Polling-Application-API)  
> ⚠️ **Nota sul Deployment (Render Free Tier):** L'API è ospitata sul piano gratuito di Render. Se il server non riceve richieste per 15 minuti, entra automaticamente in modalità "sospensione". Di conseguenza, la **prima richiesta**  potrebbe richiedere circa 50-60 secondi per "risvegliare" l'applicazione. Le richieste successive saranno totalmente immediate.

## 📖 Descrizione

Questo progetto è il client frontend per la **Polling Application**.

L'interfaccia permette di registrarsi, effettuare il login (gestendo i token JWT), scorrere i sondaggi attivi, votare in sicurezza (con blocco dei doppi voti) e visualizzare i risultati aggiornati con tanto di percentuali grafiche.

---

## ✨ Funzionalità dell'Interfaccia

- **Autenticazione Completa:** Form dedicati per il Login e la Registrazione di nuovi utenti con memorizzazione del token JWT (`access_token`).
- **Esplorazione Sondaggi:** Visualizzazione dinamica dei sondaggi disponibili tramite chiamate asincrone (`fetch`).
- **Sistema di Voto:** Interfaccia intuitiva per esprimere la propria preferenza sui sondaggi attivi (funzione abilitata solo per gli utenti loggati).
- **Risultati in Tempo Reale:** Calcolo e visualizzazione immediata delle percentuali di voto per ogni scelta.
- **Logger API Integrato:** Un pannello di debug integrato in fondo alla pagina che mostra in tempo reale gli status code delle risposte HTTP e i payload JSON restituiti dal server (utile per scopi didattici ed esaminativi).

## 📁 Struttura del progetto

Il frontend è volutamente minimale e privo di layer di build complessi (Node.js/npm) per garantire la massima portabilità:

```text
Polling-Application-Frontend/
├── index.html   
├── style.css    
├── script.js    
└── README.md    
```

---

## 🚀 Utilizzo in Locale

### 1. Clonare la repository
```bash
git clone [https://github.com/andreafilipponi04/Polling-Application-Frontend.git](https://github.com/andreafilipponi04/Polling-Application-Frontend.git)
cd Polling-Application-Frontend
```

### 2. Avviare l'applicazione
È sufficiente fare doppio clic sul file `index.html` per aprirlo direttamente in qualsiasi browser moderno (Chrome, Edge, Firefox, Safari).

---

## 🔌 Configurazione ed Endpoint API

All'interno del file `script.js` (o tramite il selettore eventualmente presente nell'interfaccia), lo stato di base punta all'URL del backend:

*   **In Locale:** `http://127.0.0.1:8000/api`
*   **In Produzione (Render):** `https://polling-application-api.onrender.com/api`

### Endpoint consumati dal Frontend:
*   🔑 Login: `POST /token/`
*   👤 Registrazione: `POST /users/` (o `/register/` a seconda della configurazione)
*   📊 Lista Sondaggi: `GET /polls/`
*   🗳️ Invio Voto: `POST /votes/`
*   📈 Risultati: `GET /polls/<id>/results/`

---

## ⚠️ Nota importante sul CORS (Cross-Origin Resource Sharing)

Quando esegui questo frontend localmente (`file://` o tramite un'estensione come *Live Server* `http://127.0.0.1:5500`), il browser bloccherà le richieste verso il backend Django almeno che quest'ultimo non sia configurato per accettarle.

Se riscontri problemi di connessione o errori nella console del browser:
1. Assicurati che nel backend Django sia installato `django-cors-headers`.
2. Verifica che nel file `settings.py` del tuo server Django sia presente l'abilitazione per l'origine del frontend:
```python
   CORS_ALLOW_ALL_ORIGINS = True  # Per lo sviluppo locale
   ```
