import { defineConfig } from '../models';

export default defineConfig({
  defaultBase: {
    name: 'Talent',
  },
  tables: [
    {
      name: 'English Levels',
      focusColumns: [
        [
          'Name',
          {
            description: 'The name of the English level',
            required: true,
          },
        ],
        [
          'Group',
          {
            description: 'The group of the English level',
            required: true,
          },
        ],
        [
          'Label',
          {
            description: 'The label of the English level',
            required: true,
          },
        ],
        [
          'Notes',
          {
            description: 'Notes about the English level',
            required: true,
          },
        ],
        [
          'Status',
          {
            description: 'The status of the English level',
          },
        ],
      ],
      views: [],
      alternativeRecordIdColumns: ['Name'],
    },
    {
      name: 'Interviews',
      focusColumns: [
        [
          'Interview',
          {
            propertyName: 'name',
          },
        ],
        'Candidate Id',
        'Candidate Name',
        'Candidate Stage',
        'Candidate',
        'Feedback Form',
        'Feedback Rating',
        'Feedback',
        'Interview Date',

        [
          'Interviewer Ids',
          {
            type: 'string[]',
          },
        ],

        'Interviewer Names',
        'Interviewers',
        [
          'Lever ID',
          {
            propertyName: 'leverId',
          },
        ],
        'Name (from Feedback Form)',
        [
          'Name (from Scheduled By)',
          {
            propertyName: 'scheduledBy.name',
          },
        ],
        [
          'Picture (from Scheduled By)',
          {
            propertyName: 'scheduledBy.photoUrl',
          },
        ],
        'Pipeline Name (from Candidate)',
        [
          'Pipelines (from Pipelines)',
          {
            propertyName: 'pipelines.name',
          },
        ],
        'Pipelines',
        [
          'Ratings Submitted Average',
          {
            propertyName: 'averageRating',
          },
        ],
        'Scheduled By Id',
        'Scheduled By',
        [
          'Seniority Ratings Submitted Average',
          {
            propertyName: 'averageSeniorityRating',
          },
        ],
        [
          'Status',
          {
            propertyName: 'isCompleted',
            type: 'boolean',
          },
        ],
        'email (from Candidate)',
        'feedback stage',
      ],
      views: ['Active Interviews'],
    },
    {
      name: 'Signups',
      focusColumns: [
        'Additional Notes',
        'Address Line 2',
        'Authorized to work',
        'Calculated Mailing Address',
        'Candidate Provided Information',
        'City',
        'Company Name',
        'Company Tax ID',
        'Compensation Type',
        'Compensation',
        [
          'Compensation Written',
          {
            example: '"One hundred thousand dollars"',
          },
        ],
        'Completed Practical Name',
        'Completed Practical',
        'Computer Election',
        'Computer Shipping Address 2',
        'Computer Shipping Address Is Different',
        'Computer Shipping Address',
        'Computer Shipping City',
        'Computer Shipping Country State/Province',
        'Computer Shipping Country',
        'Computer Shipping Postal Code',
        'Computer Size',
        'Computer Type',
        'Contract Type',
        'Contract Witness Email',
        'Contract Witness Name',
        'Country Code',
        'Country Name',
        'Country',
        'Currency',
        'Date Approved',
        'Direct Manager',
        'Email',
        'Entity Name',
        'Expiration Override',
        'Expiration',
        'HR Title (from Role)',
        'Laptop Request status',
        'Late Stage Candidate (from REQs)',
        'Late Stage Candidate Email (from REQs)',
        'Late Stage Candidate Lever Link (from REQs)',
        'Late Stage Candidate Name (from REQs)',
        'Legal First Name',
        'Legal Last Name',
        'Legal Middle Name',
        'Lever Report',
        'Mailing Address 2',
        'Mailing Address Is Different',
        'Mailing Address',
        'Mailing City',
        'Mailing Country State/Province',
        'Mailing Country',
        'Mailing Postal Code',
        'Name (from Computer Shipping Country State/Province)',
        'Name (from Computer Shipping Country)',
        'Name (from Direct Manager)',
        'Name (from Mailing Country State/Province)',
        'Name (from Mailing Country)',
        'Offer Job Description (from Role)',
        'People List',
        'Phone Number',
        'Picture (from Direct Manager)',
        'Postal Code',
        'Practical Payment Status',
        'Preferred Email Address',
        'Preferred First Name',
        'Preferred Last Name',
        'Preferred Name',
        'REQ Names',
        'REQs',
        'Recruiter Name',
        'Recruiter Photo',
        'Recruiter',
        'Relocation Considerations',
        'Role Name',
        'Role',
        'Sign On Bonus Considerations',
        'Start Date',
        'State/Province Name',
        'State/Province',
        'Status',
        'Street Address',
        'Target Account Name',
        'Target Account',
        'Tax ID',
        'Team Member Type Name',
        'Team Member Type',
        'email (from Lever Report)',
        'lever-link (from Lever Report)',
        'name (from Lever Report)',
      ],
      columnNameToObjectPropertyMapper: {
        ['Country Code']: 'country.countryCode',
        ['REQs']: {
          prefersSingleRecordLink: true,
          propertyName: 'req',
        },
        ['REQ Names']: 'req.name',
        ['Late Stage Candidate (from REQs)']: 'req.lateStageCandidateId',
        ['Picture (from Direct Manager)']: 'directManager.photoUrl',
        ['Tax ID']: 'taxId',
        ['People List']: {
          prefersSingleRecordLink: true,
          propertyName: 'teamMember',
        },
        ['State/Province']: 'state',
        ['State/Province Name']: 'state.name',
        ['Mailing Country State/Province']: 'mailingState',
        ['Company Tax ID']: 'companyTaxId',
        ['Target Account Name']: 'req.calculatedProjectName',
        ['Role Name']: 'role.name',
        ['Computer Shipping Country State/Province']: 'computerShippingState',
        ['Recruiter Photo']: 'recruiter.photoUrl',
        ['Email']: 'personalEmailAddress',
        ['Lever Report']: 'candidate',
      },
      views: ['Active Signups'],
    },
    {
      name: 'Lever Report',
      alias: 'Candidates',
      focusColumns: [
        //#region Lever Fields
        [
          'name',
          {
            required: true,
            description: 'The name of the candidate',
          },
        ],
        [
          'email',
          {
            required: true,
            description: 'The email address of the candidate',
          },
        ],
        [
          'opportunity-id',
          {
            required: true,
            propertyName: 'opportunityId',
            description: 'The lever opportunity id of the candidate',
          },
        ],
        [
          'lever-link',
          {
            required: true,
            propertyName: 'leverLink',
            description: "The link the candidate's profile in lever",
          },
        ],
        [
          'stage',
          {
            required: true,
            description: 'The stage of the candidate in lever',
          },
        ],
        [
          'position',
          {
            propertyName: 'positionName',
            description: 'The name of the position of the candidate in lever',
          },
        ],
        [
          'rating-overall',
          {
            propertyName: 'overallRating',
            description: 'The overall rating of the candidate in lever',
          },
        ],
        [
          'is-snoozed',
          {
            propertyName: 'isSnoozed',
            required: true,
            description: 'Whether the candidate is snoozed in lever',
          },
        ],
        ['timezone', {}],
        [
          'linkedin-url',
          {
            propertyName: 'linkedinUrl',
            description: `The url to the candidate's linkedin profile`,
          },
        ],
        //#endregion

        //#region Country
        [
          'Link to Country',
          {
            propertyName: 'country.id',
          },
        ],
        [
          'Country Name',
          {
            propertyName: 'country.name',
            description:
              'The name of the country where the candidate is located',
          },
        ],
        [
          'Country Code',
          {
            propertyName: 'country.countryCode',
            description:
              'The country code of the country where the candidate is located',
          },
        ],
        //#endregion

        //#region Pipeline
        [
          'pipelines',
          {
            prefersSingleRecordLink: true,
            propertyName: 'pipeline',
            required: true,
          },
        ],
        [
          'Pipeline Name',
          {
            propertyName: 'pipeline.name',
            description:
              'The name of the pipeline that the candidate is associated with',
          },
        ],
        [
          'Pipeline Short Name',
          {
            propertyName: 'pipeline.shortName',
            description:
              'The short name of the pipeline that the candidate is associated with',
          },
        ],
        'Pipeline Id',
        //#endregion

        //#region Team Member Type
        [
          'team-member-type',
          {
            propertyName: 'teamMemberType.id',
            prefersSingleRecordLink: true,
          },
        ],
        [
          'Supported Country (from team-member-type)',
          {
            propertyName: 'teamMemberType.supportedCountryIds',
            isLookupWithListOfValues: true,
            description: 'The supported countries of the team member type',
          },
        ],
        [
          'Benefits Overview',
          {
            propertyName: 'teamMemberType.benefitsOverviewLink',
            description:
              'The link to the benefits overview document of the team member type',
          },
        ],
        //#endregion

        //#region Practical Assignments
        [
          'Practical Assignment',
          {
            propertyName: 'practicalAssignments.id',
            editable: false,
          },
        ],
        [
          'Practical Name',
          {
            propertyName: 'practicalAssignments.practicalName',
            description: 'The name of the practical',
          },
        ],
        //#endregion

        //#region REQ
        [
          'REQs',
          {
            prefersSingleRecordLink: true,
            propertyName: 'req.id',
            creatable: false,
          },
        ],
        [
          'REQ (from REQs)',
          {
            propertyName: 'req.name',
            description: 'The name of the REQ',
          },
        ],
        //#endregion

        //#region Signup
        [
          'Signup',
          {
            propertyName: 'signup.id',
            creatable: false,
          },
        ],
        [
          'Preferred Name (from Signup)',
          {
            propertyName: 'signup.preferredName',
            description: 'The preferred name of the candidate',
          },
        ],
        [
          'Can Request Company Laptop',
          {
            description:
              'Whether the candidate can request a company laptop during signup',
          },
        ],
        //#endregion

        //#region Resume
        [
          'resume-file-name',
          {
            propertyName: 'resumeFileName',
            description: 'The name of the resume file',
          },
        ],
        [
          'resume-id',
          {
            propertyName: 'resumeLeverId',
            description: 'The lever id of the resume',
          },
        ],
        //#endregion

        [
          'feedback-count',
          {
            propertyName: 'feedbackCount',
            description: 'The amount of feedback submitted for the candidate',
          },
        ],
        [
          'Practical Assignments Count',
          {
            description:
              'The number of practical assignments for the candidate',
          },
        ],
        [
          'Interviews Count',
          {
            description: 'The number of interviews for the candidate',
          },
        ],

        [
          'seniority-rating-average',
          {
            propertyName: 'seniorityRatingAverage',
            description: 'The average seniority rating of the candidate',
          },
        ],

        [
          'days-spent-in-invited-to-offline-assessment',
          {
            propertyName: 'daysSpentInInvitedToOfflineAssessmentStage',
            description:
              'The number of days spent in the invited to offline stage',
          },
        ],

        [
          'days-spent-in-offline-assessment',
          {
            propertyName: 'daysSpentInOfflineAssessmentStage',
            description:
              'The number of days spent in the offline assessment stage',
          },
        ],

        [
          'days-spent-in-internal-introduction',
          {
            propertyName: 'daysSpentInInternalIntroductionStage',
            description:
              'The number of days spent in the internal introduction stage',
          },
        ],
        [
          'days-spent-in-introduction-screen',
          {
            propertyName: 'daysSpentInIntroductionScreenStage',
            description:
              'The number of days spent in the introduction screen stage',
          },
        ],
      ],
      views: [
        'Late Stage - Ready For Practical',
        'Topology - Reviewable Applicants',
      ],
    },
  ],
  includeAirtableSpecificQueryParameters: true,
});
