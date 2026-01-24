# Asset Return (Handover) Feature - Implementation Summary

## ✅ Implementation Complete

### API Endpoint
- **Method:** `POST`
- **Endpoint:** `/api/v1/assignments/:id/return`
- **Authentication:** Required (JWT Bearer token)
- **Authorization:** Admin or Manager role only

### Request Format

**URL Parameters:**
- `id` (string, required): Assignment ID (MongoDB ObjectId, 24 hex characters)

**Request Body:**
```json
{
  "condition": "GOOD" | "DAMAGED",
  "remarks": "string (optional)"
}
```

**Example Request:**
```bash
POST /api/v1/assignments/507f1f77bcf86cd799439011/return
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "condition": "GOOD",
  "remarks": "Asset returned in excellent condition"
}
```

### Response Format

**Success Response (200):**
```json
{
  "message": "Asset returned successfully",
  "assignment": {
    "_id": "507f1f77bcf86cd799439011",
    "asset": { /* populated asset object */ },
    "employee": { /* populated employee object */ },
    "status": "Returned",
    "returnedAt": "2026-01-10T14:30:00.000Z",
    "returnDate": "2026-01-10T14:30:00.000Z",
    "condition": "GOOD",
    "remarks": "Asset returned in excellent condition",
    ...
  }
}
```

**Error Responses:**

- **400 Bad Request:** Assignment already returned, invalid condition, validation errors
- **401 Unauthorized:** Missing or invalid JWT token
- **403 Forbidden:** Insufficient permissions (not Admin/Manager)
- **404 Not Found:** Assignment or Asset not found

### Business Logic Implementation

1. **Validation:**
   - ✅ Assignment exists and is active (status = "Active")
   - ✅ Prevents returning already returned assignments
   - ✅ Validates condition is "GOOD" or "DAMAGED"
   - ✅ Validates assignment ID format (24 hex characters)

2. **Assignment Update:**
   - ✅ Sets `assignment.status = "Returned"`
   - ✅ Sets `assignment.returnDate = current date`
   - ✅ Sets `assignment.returnedAt = current date`
   - ✅ Stores `condition` (GOOD or DAMAGED)
   - ✅ Stores optional `remarks` string
   - ✅ Maintains full assignment history (no deletion)

3. **Asset Status Update:**
   - ✅ If `condition = "GOOD"` → Asset status = `"Available"`
   - ✅ If `condition = "DAMAGED"` → Asset status = `"In Repair"`
   - ✅ Clears `asset.currentHolder = undefined`

4. **Security:**
   - ✅ Protected with JWT authentication
   - ✅ Restricted to Admin and Manager roles only
   - ✅ Proper error handling with appropriate HTTP status codes

### Files Modified

1. **`backend/src/models/Assignment.ts`**
   - Added `returnedAt?: Date` field
   - Added `condition?: 'GOOD' | 'DAMAGED'` field
   - Added `remarks?: string` field

2. **`backend/src/utils/zodSchemas.ts`**
   - Added `returnAssetSchema` with:
     - `condition`: enum ['GOOD', 'DAMAGED'] (required)
     - `remarks`: string (optional)

3. **`backend/src/services/assignment.service.ts`**
   - Added new `returnAssetById()` function:
     - Validates assignment exists and is active
     - Updates assignment with return details
     - Updates asset status based on condition
     - Returns populated assignment object

4. **`backend/src/controllers/assignment.controller.ts`**
   - Added `returnAssetByIdController()`:
     - Extracts assignment ID from route params
     - Validates ID format
     - Validates request body with Zod schema
     - Handles specific error cases (404, 400)
     - Returns appropriate HTTP status codes

5. **`backend/src/routes/assignment.routes.ts`**
   - Added route: `POST /:id/return`
   - Protected with `authenticate` middleware
   - Protected with `authorize('Admin', 'Manager')` middleware
   - Positioned before `GET /:id` route for proper routing

### Database Schema Updates

**Assignment Model:**
```typescript
{
  ...
  returnDate?: Date;        // Existing field
  returnedAt?: Date;        // NEW: Timestamp of return
  condition?: 'GOOD' | 'DAMAGED';  // NEW: Return condition
  remarks?: string;         // NEW: Optional remarks
  ...
}
```

### Testing the API

**1. Get an active assignment ID:**
```bash
GET /api/v1/assignments?status=Active
Authorization: Bearer <token>
```

**2. Return asset with GOOD condition:**
```bash
POST /api/v1/assignments/{assignmentId}/return
Authorization: Bearer <token>
Content-Type: application/json

{
  "condition": "GOOD",
  "remarks": "Asset in perfect condition"
}
```

**3. Return asset with DAMAGED condition:**
```bash
POST /api/v1/assignments/{assignmentId}/return
Authorization: Bearer <token>
Content-Type: application/json

{
  "condition": "DAMAGED",
  "remarks": "Screen cracked, needs repair"
}
```

**4. Verify asset status updated:**
```bash
GET /api/v1/assets/{assetId}
Authorization: Bearer <token>
```
- Should show status = "Available" (if condition was GOOD)
- Should show status = "In Repair" (if condition was DAMAGED)

**5. Verify assignment history:**
```bash
GET /api/v1/assignments/history?assetId={assetId}
Authorization: Bearer <token>
```
- Should show the returned assignment with status = "Returned"
- Should include returnedAt, condition, and remarks

### Error Scenarios Handled

1. **Assignment not found (404):**
   ```json
   {
     "message": "Assignment not found"
   }
   ```

2. **Already returned (400):**
   ```json
   {
     "message": "Assignment is already returned"
   }
   ```

3. **Invalid condition (400):**
   ```json
   {
     "message": "Validation error",
     "errors": [
       {
         "path": "condition",
         "message": "Condition must be either GOOD or DAMAGED"
       }
     ]
   }
   ```

4. **Invalid assignment ID format (400):**
   ```json
   {
     "message": "Invalid assignment ID format"
   }
   ```

5. **Unauthorized (401):**
   ```json
   {
     "message": "No token provided"
   }
   ```

6. **Forbidden (403):**
   ```json
   {
     "message": "Access denied. Admin or Manager role required."
   }
   ```

### Notes

- ✅ The old `PATCH /return` endpoint still exists for backward compatibility
- ✅ Full assignment history is maintained (no records are deleted)
- ✅ Asset status is automatically updated based on return condition
- ✅ All changes are properly validated and error-handled
- ✅ Code compiles without errors
- ✅ All TypeScript types are properly defined

### Next Steps (Frontend Integration)

To integrate this feature in the frontend:

1. Update the `assignment.api.ts` to add the new return method:
   ```typescript
   returnAsset: async (assignmentId: string, data: { condition: 'GOOD' | 'DAMAGED', remarks?: string }) => {
     const response = await apiClient.post(`/assignments/${assignmentId}/return`, data);
     return response.data.assignment;
   }
   ```

2. Update the return asset modal/form to include:
   - Condition dropdown (GOOD/DAMAGED)
   - Remarks text area
   - Proper validation

3. Update the UI to reflect asset status changes after return

---

**Implementation Date:** January 10, 2026
**Status:** ✅ Complete and Ready for Testing
