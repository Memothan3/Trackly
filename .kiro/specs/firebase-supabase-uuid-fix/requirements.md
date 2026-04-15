# Requirements Document

## Introduction

This specification addresses the Firebase-Supabase UUID compatibility issue that prevents Firebase users from successfully creating profiles in the Supabase database. The core problem is that Firebase generates TEXT-based UIDs (e.g., "3MTA7worwtc3m0B6k8eQdRz5mSf1") while Supabase database columns are configured as UUID type expecting RFC 4122 format (e.g., "550e8400-e29b-41d4-a716-446655440000"). This mismatch causes "invalid input syntax for type uuid" errors and prevents user profile creation, breaking the authentication flow.

## Glossary

- **Firebase_Auth**: Firebase Authentication service that generates TEXT-based user IDs
- **Supabase_DB**: Supabase PostgreSQL database with UUID-typed columns
- **Firebase_UID**: TEXT string identifier from Firebase (e.g., "3MTA7worwtc3m0B6k8eQdRz5mSf1")
- **UUID_Column**: PostgreSQL column with UUID data type expecting RFC 4122 format
- **RLS_Policy**: Row Level Security policy that restricts database access
- **Profile_Sync**: Process of creating user profile in Supabase after Firebase authentication
- **Foreign_Key_Constraint**: Database constraint linking tables via ID relationships
- **Schema_Migration**: Process of converting database column types while preserving data integrity

## Requirements

### Requirement 1: Database Schema Conversion

**User Story:** As a system administrator, I want to convert all UUID columns to TEXT type, so that Firebase UIDs can be stored without type conversion errors.

#### Acceptance Criteria

1. THE Schema_Migration SHALL convert all primary key ID columns from UUID to TEXT type
2. THE Schema_Migration SHALL convert all foreign key ID columns from UUID to TEXT type  
3. WHEN converting column types, THE Schema_Migration SHALL preserve all existing data
4. THE Schema_Migration SHALL handle the following tables: profiles, accounts, transactions, categories, scheduled_transactions, budgets, receipts, notifications, projects
5. FOR ALL converted columns, THE Schema_Migration SHALL maintain referential integrity through foreign key constraints

### Requirement 2: RLS Policy Management

**User Story:** As a system administrator, I want to temporarily disable RLS policies during migration, so that column type changes are not blocked by policy definitions.

#### Acceptance Criteria

1. BEFORE schema conversion, THE Migration_Process SHALL drop all existing RLS policies
2. BEFORE schema conversion, THE Migration_Process SHALL disable Row Level Security on all affected tables
3. THE Migration_Process SHALL document all dropped policies for potential restoration
4. AFTER successful migration, THE Migration_Process SHALL provide option to re-enable RLS with TEXT-compatible policies

### Requirement 3: Foreign Key Constraint Handling

**User Story:** As a system administrator, I want foreign key constraints to be properly managed during migration, so that data relationships remain intact.

#### Acceptance Criteria

1. BEFORE column type conversion, THE Migration_Process SHALL drop all foreign key constraints that reference ID columns
2. AFTER column type conversion, THE Migration_Process SHALL recreate foreign key constraints with appropriate CASCADE and SET NULL behaviors
3. THE Migration_Process SHALL verify that all foreign key relationships function correctly with TEXT IDs
4. IF constraint recreation fails, THEN THE Migration_Process SHALL provide detailed error information and rollback instructions

### Requirement 4: Firebase UID Compatibility Testing

**User Story:** As a developer, I want to verify that Firebase UIDs work correctly with the converted schema, so that user authentication flows function properly.

#### Acceptance Criteria

1. THE Migration_Process SHALL test profile creation using actual Firebase UID format
2. THE Test_Suite SHALL verify that Firebase UIDs like "3MTA7worwtc3m0B6k8eQdRz5mSf1" can be inserted successfully
3. THE Test_Suite SHALL verify that foreign key relationships work with Firebase UID format
4. THE Test_Suite SHALL clean up test data after verification
5. IF any test fails, THEN THE Migration_Process SHALL report specific failure details

### Requirement 5: Profile Synchronization Fix

**User Story:** As a user, I want to successfully create a profile after Google sign-in, so that I can access the dashboard without database errors.

#### Acceptance Criteria

1. WHEN a Firebase user signs in, THE Profile_Sync SHALL create a Supabase profile using the Firebase UID as TEXT
2. THE Profile_Sync SHALL handle duplicate username scenarios gracefully
3. IF profile creation fails due to UUID errors, THEN THE Profile_Sync SHALL provide clear error messages indicating the need for schema migration
4. THE Profile_Sync SHALL support both email/password and Google OAuth authentication flows
5. AFTER successful profile creation, THE Profile_Sync SHALL redirect users to the dashboard

### Requirement 6: Error Handling and User Feedback

**User Story:** As a user, I want clear error messages when database issues occur, so that I understand what went wrong and what actions to take.

#### Acceptance Criteria

1. WHEN UUID type errors occur, THE Error_Handler SHALL display user-friendly messages explaining the compatibility issue
2. THE Error_Handler SHALL provide technical details for developers including specific SQL errors
3. THE Error_Handler SHALL offer links to diagnostic tools for developers (RLS Fix Tool, UUID Fix Tool)
4. THE Error_Handler SHALL distinguish between UUID compatibility errors, RLS policy errors, and other database errors
5. THE Error_Handler SHALL log detailed error information for debugging purposes

### Requirement 7: Rollback and Recovery

**User Story:** As a system administrator, I want rollback capabilities during migration, so that I can recover if issues occur during the conversion process.

#### Acceptance Criteria

1. BEFORE starting migration, THE Migration_Process SHALL create a complete database backup
2. THE Migration_Process SHALL provide step-by-step rollback instructions for each migration phase
3. IF migration fails at any step, THEN THE Migration_Process SHALL offer automated rollback to the previous state
4. THE Migration_Process SHALL verify database integrity after rollback completion
5. THE Migration_Process SHALL document all changes made during migration for audit purposes

### Requirement 8: Data Integrity Verification

**User Story:** As a system administrator, I want comprehensive data integrity checks, so that no data is lost or corrupted during the migration process.

#### Acceptance Criteria

1. BEFORE migration, THE Verification_Process SHALL count all records in affected tables
2. AFTER migration, THE Verification_Process SHALL verify that record counts match pre-migration counts
3. THE Verification_Process SHALL validate that all foreign key relationships remain functional
4. THE Verification_Process SHALL test basic CRUD operations on all converted tables
5. IF any integrity check fails, THEN THE Verification_Process SHALL halt migration and provide detailed failure reports

### Requirement 9: Performance Impact Assessment

**User Story:** As a system administrator, I want to understand performance implications of TEXT vs UUID columns, so that I can make informed decisions about the migration.

#### Acceptance Criteria

1. THE Migration_Process SHALL document the performance characteristics of TEXT vs UUID columns
2. THE Migration_Process SHALL provide recommendations for indexing strategies with TEXT IDs
3. THE Migration_Process SHALL measure query performance before and after migration on sample datasets
4. THE Migration_Process SHALL document any performance degradation and mitigation strategies
5. THE Migration_Process SHALL provide guidance on monitoring database performance post-migration

### Requirement 10: Authentication Flow End-to-End Testing

**User Story:** As a quality assurance engineer, I want comprehensive end-to-end testing of the authentication flow, so that all user scenarios work correctly after migration.

#### Acceptance Criteria

1. THE Test_Suite SHALL verify Google OAuth sign-in creates profiles successfully
2. THE Test_Suite SHALL verify email/password registration creates profiles successfully  
3. THE Test_Suite SHALL verify existing user sign-in continues to work after migration
4. THE Test_Suite SHALL verify profile completion flow works with Firebase UIDs
5. THE Test_Suite SHALL verify dashboard access works for users with TEXT-based IDs