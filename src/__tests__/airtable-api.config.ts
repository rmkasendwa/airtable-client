import { defineConfig } from '../models';

export default defineConfig({
  defaultBase: {
    name: 'Talent',
  },
  tables: [
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

        [
          'tags',
          {
            type: 'string[]',
            arrayItemSeparator: ', ',
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
