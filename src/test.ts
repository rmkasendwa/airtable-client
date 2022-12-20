import { findAllTablesByBaseId } from './api';
import {
  findAirtableBaseById,
  findAllAirtableBases,
} from './api/Metadata/Bases';

(async () => {
  const { bases } = await findAllAirtableBases();
  const talentBase = bases.find(({ name }) => name.trim().match(/^Talent$/g));
  if (talentBase) {
    const talentBaseDetails = await findAirtableBaseById(talentBase.id);
    const { tables } = await findAllTablesByBaseId(talentBase.id);

    console.log({ talentBase, talentBaseDetails, tables });
  }
})();
