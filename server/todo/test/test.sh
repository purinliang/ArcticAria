curl -X POST https://todo.arcticaria.workers.dev/todo \
 -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJjZWY4ZGU3OS1iODVhLTRiZGEtODU2MC0xN2I3YjI2YzQwM2IiLCJlbWFpbCI6InB1cmlubGlhbmdAZ21haWwuY29tIiwiaWF0IjoxNzUzNTA2MjUzLCJleHAiOjE3NTQxMTEwNTN9.Hbrg5XrpGgVX738pIUpGEafR3W609me5hNuIhuQTf88" \
 -H "Content-Type: application/json" \
 -d '{"title": Test Todo Title", "content": "Test Todo Content"}'

curl -X GET http://localhost:42193/todo \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJhYzMxNTE4MC04YmUwLTQxMjAtODUzMS1iZjUzMDlmMTFmMDMiLCJlbWFpbCI6IjEyMyIsImlhdCI6MTc1MzUwNDkxNSwiZXhwIjoxNzU0MTA5NzE1fQ.szoleFKObvpmMVE-_ysMLe2jqq4K-sCQLLiemPWylnk"
