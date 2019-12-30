GET http://localhost:3000/posts Authorization: Bearer token

###

DELETE http://localhost:3000/logout Content-Type: application/json

{
"token": refreshtoken
}

###

POST http://localhost:3000/token Content-Type: application/json

{
"token": "refresh token"
}

###

POST http://localhost:3000/login Content-Type: application/json

{
"username": "Jim"
}