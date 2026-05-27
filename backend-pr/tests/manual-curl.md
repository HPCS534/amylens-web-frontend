Manual tests for review auditing

1) POST a review (replace host/auth as needed):

```bash
curl -v -X POST "http://localhost:8080/api/sessions/<<SESSION_ID>>/review" \
  -H "Content-Type: application/json" \
  -d '{"action":"approve","reviewerNote":"Looks good","reviewerIdentity":"admin"}' \
  -b cookiejar.txt
```

2) GET the session to verify audit fields:

```bash
curl -v "http://localhost:8080/api/sessions/<<SESSION_ID>>" -b cookiejar.txt
# Response should include reviewerIdentity, reviewerTimestamp, reviewerNote
```

3) If using Spring Security form login, create cookiejar via:

```bash
curl -c cookiejar.txt -d "username=admin&password=test" -X POST http://localhost:8080/api/auth/login
```
