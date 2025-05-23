# DT207G - Projekt del 1
## API för en restaurang

Repot innehåller källkod för ett express-baserat API, som hanterar användare, meny, bokningar och recensioner. Det använder JSON Web Token (JWT) för auktorisering vid redigering av menyn och utläsningar av bokningar. API:et har stöd för CRUD genom att meny och bokningar kan skapas, läsas ut, uppdateras och raderas. Recensioner kan också läsas ut och raderas. En användare kan även skapa nya användare och lösenord hashas med bcrypt. Alla CRUD metoder använder parameteriserade SQL-frågor för att undvika SQL-injections.

API:et är kopplat till en Postgre relationsdatabas som hostas av Render. Vid anrop returneras JSON-objekt. Grundlänken till API:et är [https://projekt-databas.onrender.com/api](https://projekt-databas.onrender.com/api).

### API för användare
Användare krävs för att ge behörighet att komma åt vissa metoder på router. När en användare loggar in skickas ett "token" som används för att komma åt router.

#### Router för användare
Följande router kan användas för att nå användare:
| Metod     | Länk                | Resultat                        |
|-----------|---------------------|---------------------------------|
| POST      | /register           | Skapa ny användare              |
| POST      | /login              | Lagg in användare               |

#### Användare objekt
Vid skapande av en användare och inloggning med POST-metoden ska objekt enligt strukturen nedan skickas till API:et med POST-metoden:
```json
  {
    "username": "hovmästaren",
    "password": "password"
  }
```

### API för meny
API:et stöttar två menyer - en drinkmeny och en tapasmeny.

#### Router för meny
Följande router kan användas för att nå tapasmenyn:
| Metod     | Länk                | Resultat                        |
|-----------|---------------------|---------------------------------|
| POST      | /tapasmenu          | Lägg till en tapasrätt          |
| GET       | /menu/tapasmenu     | Returnerar alla tapas rätter    |
| PUT       | /tapasmenu/:id      | Redigera en tapasrätt           |
| DELETE    | /tapasmenu/:id      | Ta bort en tapasrätt            |

Följande router kan användas för att nå drinkmenyn:
| Metod     | Länk                | Resultat                        |
|-----------|---------------------|---------------------------------|
| POST      | /drinkmenu          | Lägg till en drink              |
| GET       | /menu/drinkmenu     | Returnerar alla drinkar         |
| PUT       | /drinkmenu/:id      | Redigera en drink               |
| DELETE    | /drinkmenu/:id      | Ta bort en drink                |

#### Meny objekt
Vid skapande av en tapasrätt eller drink ska objekt enligt strukturen nedan skickas till API:et med POST-metoden:
```json
  {
    "name": "Toast Skagen",
    "description": "Lyxig tapasrätt med skagenröra.",
    "price": 75
  }
```

Vid utläsning av menyn returneras då detta objekt med GET-metoden:
```json
  {
    "tapas_code": 2,
    "name": "Toast Skagen",
    "description": "Lyxig tapasrätt med skagenröra.",
    "availability": true,
    "price": 75
  }
```

### API för bokningar
Bokningar kan skapas utan behörighet, men endast läsas ut, redigeras och tas bort med.

Följande router kan användas för att nå bokningar:
| Metod     | Länk                | Resultat                        |
|-----------|---------------------|---------------------------------|
| POST      | /menu/bookings      | Lägg till bokningar             |
| GET       | /bookings           | Returnerar alla drinkar         |
| PUT       | /bookings/:id       | Redigera en drink               |
| DELETE    | /bookings/:id       | Ta bort en drink                |

#### Boknings objekt
Vid skapande av en bokning ska objekt enligt strukturen nedan skickas till API:et med POST-metoden:
```json
  {
    "firstname": "Sven",
    "surname": "Svensson",
    "email": "sven.svensson@mejl.se",
    "bookedDate": "2025-06-15",
    "bookedTime": "18:20",
    "peopleSum": 5,
    "message": "En nötallergiker med i gruppen."
  }
```

Vid GET-anrop returneras en array med boknings objekt. Exemplet ovan skapar följande objekt:
```json
  {
    "booking_num": 1,
    "message": "En nötallergiker med i gruppen.",
    "booked_date": "2025-06-14T22:00:00.000Z",
    "booked_time": "18:20:00",
    "people": 5,
    "created": "2025-05-22T22:00:00.000Z",
    "confirmed": false,
    "customer_id": 1,
    "firstname": "Sven",
    "surname": "Svensson",
    "email": "sven.svensson@mejl.se"
  }
```

### API för recensioner
Recensioner kan skapas och läsas ut utan behörighet, men endast tas bort med.

Följande router kan användas för att nå recensioner:
| Metod     | Länk                | Resultat                        |
|-----------|---------------------|---------------------------------|
| POST      | /menu/reviews       | Lägg till recensioner           |
| GET       | /reviews            | Returnerar alla recensioner     |
| DELETE    | /reviews/:id        | Ta bort en recension            |

#### Recensions objekt
Vid skapande av en recension med POST-metoden ska objekt enligt följande struktur skickas till API:et:
```json
  {
    "firstname": "Sven",
    "surname": "Svensson",
    "email": "sven.svensson@mejl.se",
    "message": "Riktigt trevlig restaurang och goda tapas!"
  }
```

Vid hämtning av recensioner med GET-metoden returneras en array med objekt. Exemplet ovan skapar följande objekt:
```json
  {
    "message_id": 12,
    "customer_id": 1,
    "message": "Riktigt trevlig restaurang och goda tapas!"
  }
```

_Kim Dudenhöfer, 2025-05-23_