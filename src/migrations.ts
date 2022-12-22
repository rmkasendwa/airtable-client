import { writeFileSync } from 'fs-extra';

import {
  createAssignments,
  createPositions,
  findAllAssignments,
  findAllResourcings,
} from './__sandbox/bases/TalentTopologyTestApps';

/**
 * Moves resourcing records from resourcing table to assignments table.
 *
 * @param offset The next airtable page offset.
 */
const moveResourcingsToAssignmentsTable = async (offset?: string) => {
  const { records: pageResourcings, offset: responseOffset } =
    await findAllResourcings({ offset });

  if (pageResourcings.length > 0) {
    const mapAssignmentRecords = async (
      workingResourcings: typeof pageResourcings
    ) => {
      workingResourcings = [...workingResourcings];
      if (workingResourcings.length > 0) {
        await createAssignments(
          workingResourcings
            .splice(0, 10)
            .map(
              ({
                slot,
                projectOverride,
                projectRole,
                teamMember,
                resourceStart,
                resourceEnd,
                sow,
                allocation,
                status,
              }) => {
                return {
                  name: slot,
                  billingAllocation: allocation,
                  timingAllocation: allocation,
                  startDate: resourceStart,
                  endDate: resourceEnd,
                  project: projectOverride,
                  resourcingStatus: status,
                  role: projectRole,
                  teamMember,
                  sow,
                };
              }
            )
        );
        if (workingResourcings.length > 0) {
          await mapAssignmentRecords(workingResourcings);
        }
      }
    };
    await mapAssignmentRecords(pageResourcings);
    if (responseOffset) {
      await moveResourcingsToAssignmentsTable(responseOffset);
    } else {
      console.log(`Moving completed!`);
    }
  }
};

/**
 * Clones assignment records into positions table.
 *
 * @param offset The next airtable page offset.
 */
const cloneAssignmentsToPositionsTable = async (offset?: string) => {
  const { records: pageAssignments, offset: responseOffset } =
    await findAllAssignments({ offset });

  if (pageAssignments.length > 0) {
    const mapPositionRecords = async (
      workingAssignments: typeof pageAssignments
    ) => {
      workingAssignments = [...workingAssignments];
      if (workingAssignments.length > 0) {
        await createPositions(
          workingAssignments
            .splice(0, 10)
            .map(
              ({
                id,
                role,
                project,
                sow,
                timingAllocation,
                billingAllocation,
              }) => {
                return {
                  role,
                  project,
                  sow,
                  plannedTimingAllocation: timingAllocation,
                  plannedBillingAllocation: billingAllocation,
                  assignment: id,
                };
              }
            )
        );
        if (workingAssignments.length > 0) {
          await mapPositionRecords(workingAssignments);
        }
      }
    };
    await mapPositionRecords(pageAssignments);
    if (responseOffset) {
      await cloneAssignmentsToPositionsTable(responseOffset);
    } else {
      console.log(`Cloning completed!`);
    }
  }
};

(async () => {
  try {
    // await moveResourcingsToAssignmentsTable();
    await cloneAssignmentsToPositionsTable();
  } catch (err: any) {
    const errorFilePath = `${__dirname}/error.json`;
    console.log(`Processing failed with error writted to ${errorFilePath}`);
    if (err.isAxiosError) {
      writeFileSync(
        errorFilePath,
        JSON.stringify([err.response?.data, err], null, 2)
      );
    } else {
      writeFileSync(`${__dirname}/error.json`, JSON.stringify(err, null, 2));
    }
  }
})();
