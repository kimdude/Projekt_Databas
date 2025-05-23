# DT207G - Projekt del 1
## API för en restaurang

Repot innehåller källkod för ett express-baserat API, som hanterar användare, meny, bokningar och recensioner. Det använder JSON Web Token (JWT) för auktorisering vid redigering av menyn och utläsningar av bokningar. API:et har stöd för CRUD genom att meny och bokningar kan skapas, läsas ut, uppdateras och raderas. Recensioner kan också läsas ut och raderas. En användare kan även skapa nya användare och lösenord hashas med bcrypt. Alla CRUD metoder använder parameteriserade SQL-frågor för att undvika SQL-injections.

API:et är kopplat till en Postgre relationsdatabas som hostas av Render. Vid anrop returneras JSON-objekt. Grundlänken till API:et är [FIXA LÄNKEN](FIXA LÄNKEN).

### API för meny
API:et stöttar två menyer - en drinkmeny och en tapasmeny.

#### Router för meny

Följande router kan användas för att nå tapasmenyn:
| Metod     | Länk                | Resultat                        |
|-----------|---------------------|---------------------------------|
| POST      | /tapasmenu          | Lägg till en tapasrätt          |
| PUT       | /tapasmenu/:id      | Redigera en tapasrätt           |
| DELETE    | /tapasmenu/:id      | Ta bort en tapasrätt            |
| GET       | /menu/tapasmenu     | Returnerar alla tapas rätter    |

Följande router kan användas för att nå drinkmenyn:
| Metod     | Länk                | Resultat                        |
|-----------|---------------------|---------------------------------|
| POST      | /drinkmenu          | Lägg till en drink              |
| PUT       | /drinkmenu/:id      | Redigera en drink               |
| DELETE    | /drinkmenu/:id      | Ta bort en drink                |
| GET       | /menu/drinkmenu     | Returnerar alla drinkar         |

#### Meny objekt
Vid skapande av en tapasrätt eller drink ska följande objekt skickas till API:et med POST-metoden:
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

_Kim Dudenhöfer, 2025-05-23_