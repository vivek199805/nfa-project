import BaseRepository from "../repositories/base.repository.js";

const userRepository = new BaseRepository("user");
const twoAuthRepository = new BaseRepository("twoAuth");

async function normalizeUserEmails() {
  const users = await userRepository.findMany({}, {
    select: { id: true, email: true },
  });

  for (const user of users) {
    const normalizedEmail = user.email?.trim().toLowerCase();
    if (!normalizedEmail || normalizedEmail === user.email) continue;

    const conflictingUser = await userRepository.findFirst(
      {
        id: { not: user.id },
        email: normalizedEmail,
      },
      {
        select: { id: true },
      }
    );

    if (conflictingUser) {
      console.warn(
        `Skipped email normalization for user ${user.id}: normalized email conflicts with ${conflictingUser.id}`
      );
      continue;
    }

    await userRepository.updateById(user.id, { email: normalizedEmail });
  }
}

async function normalizeTwoAuthEmails() {
  const rows = await twoAuthRepository.findMany({
    email: { not: null },
  }, {
    select: { id: true, email: true },
  });

  for (const row of rows) {
    const normalizedEmail = row.email?.trim().toLowerCase();
    if (!normalizedEmail || normalizedEmail === row.email) continue;

    await twoAuthRepository.updateById(row.id, { email: normalizedEmail });
  }
}

export async function runStartupMaintenance() {
  try {
    await normalizeUserEmails();
    await normalizeTwoAuthEmails();
    console.log("Startup maintenance completed.");
  } catch (error) {
    console.error("Startup maintenance warning:", error.message);
  }
}
