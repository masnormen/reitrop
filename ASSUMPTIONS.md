# Assumptions

This doc lists the assumptions made in the design and implementation of this project.

---

Since I have no access to the complete API schema of https://portier-takehometest.onrender.com/api/v1/data/sync, I am assuming that the API needs this query based on the shown error response:

```
"query parameter 'application_id' is required"
"unsupported application_id; valid values are: salesforce, hubspot, stripe, slack, zendesk, intercom"
```

Assumed schema:

```
GET /api/v1/data/sync

Query Parameters:
- application_id: 'salesforce' | 'hubspot' | 'stripe' | 'slack' | 'zendesk' | 'intercom'
  The application for which the data sync is being requested.
```
