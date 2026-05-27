This bundle prepares a patch and database migration to persist review audit information (reviewer identity, timestamp, and note) in the backend repository.

Branch to create: `test-integration`

Files in this bundle:
- `migrations/V1__add_review_audit.sql` — SQL migration to add columns for review audit.
- `patches/session-review-audit.diff` — suggested git-style diff to apply to the backend sources.
- `tests/manual-curl.md` — manual test snippets to exercise the updated endpoint.

How to apply (in the backend repo root):

1. Create and switch to the branch:

```bash
git fetch origin
git checkout -b test-integration
```

2. Apply the SQL migration file to your migration folder (Flyway/liquibase) or run manually:

- If using Flyway, copy `migrations/V1__add_review_audit.sql` into `src/main/resources/db/migration/`.
- Otherwise, run the `ALTER TABLE` statements against your database.

3. Apply the patch file (recommended):

```bash
# from repo root
patch -p1 < /path/to/session-review-audit.diff
# or use git apply
git apply /path/to/session-review-audit.diff
```

4. Build and run tests:

```bash
./mvnw -DskipTests=false test
./mvnw -DskipTests=false package
```

5. Start the app and test the review endpoint using the examples in `tests/manual-curl.md`.

6. Commit and push the branch:

```bash
git add .
git commit -m "Persist session review audit: reviewerIdentity, reviewerTimestamp, reviewerNote"
git push origin test-integration
```

7. Open a Pull Request on GitHub from `test-integration` into your main branch and request review.

Notes:
- The included patch is a suggested minimal change; adapt DTO and repository names to match your project's packages.
- The migration is idempotent-safe if columns are not present; remove or adjust if you already have similar columns.
