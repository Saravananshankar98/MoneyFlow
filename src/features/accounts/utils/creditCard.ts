import { Account } from "../types/account";

export function getOutstanding(
  account: Account
) {
  return (
    account.outstanding ??
    account.balance ??
    0
  );
}

export function getAvailableLimit(
  account: Account
) {
  return Math.max(
    0,
    (account.creditLimit ?? 0) -
      getOutstanding(account)
  );
}

export function formatCreditCardDate(
  date: Date
) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return `${String(
    date.getDate()
  ).padStart(2, "0")}-${
    months[date.getMonth()]
  }`;
}

export function getNextDueDate(
  account: Account,
  fromDate = new Date()
) {
  return getPaymentDueDate(
    account,
    fromDate
  );
}

function getClampedDate(
  year: number,
  month: number,
  day: number
) {
  const lastDay =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  return new Date(
    year,
    month,
    Math.min(day, lastDay),
    23,
    59,
    59,
    999
  );
}

function getDayDiff(
  targetDate: Date,
  fromDate: Date
) {
  const dayMs =
    24 * 60 * 60 * 1000;

  return Math.ceil(
    (targetDate.getTime() -
      fromDate.getTime()) /
      dayMs
  );
}

export function getStatementDate(
  account: Account,
  fromDate = new Date()
) {
  const statementDay =
    account.billingCycleEndDay ??
    1;

  const currentStatement =
    getClampedDate(
      fromDate.getFullYear(),
      fromDate.getMonth(),
      statementDay
    );

  if (
    currentStatement >= fromDate
  ) {
    return currentStatement;
  }

  return getClampedDate(
    fromDate.getFullYear(),
    fromDate.getMonth() + 1,
    statementDay
  );
}

export function getPaymentDueDate(
  account: Account,
  fromDate = new Date()
) {
  const statementDay =
    account.billingCycleEndDay ??
    1;

  const dueDay =
    account.dueDateDay ??
    statementDay;

  const buildDueDate = (
    statementDate: Date
  ) => {
    const dueMonth =
      dueDay <=
      statementDate.getDate()
        ? statementDate.getMonth() +
          1
        : statementDate.getMonth();

    return getClampedDate(
      statementDate.getFullYear(),
      dueMonth,
      dueDay
    );
  };

  const previousStatement =
    getClampedDate(
      fromDate.getFullYear(),
      fromDate.getMonth() - 1,
      statementDay
    );

  const currentStatement =
    getClampedDate(
      fromDate.getFullYear(),
      fromDate.getMonth(),
      statementDay
    );

  if (
    currentStatement <= fromDate
  ) {
    return buildDueDate(
      currentStatement
    );
  }

  const previousDueDate =
    buildDueDate(
      previousStatement
    );

  if (
    previousDueDate >=
      fromDate ||
    getOutstanding(account) > 0
  ) {
    return previousDueDate;
  }

  return buildDueDate(
    currentStatement
  );
}

export function getDaysUntilStatement(
  account: Account,
  fromDate = new Date()
) {
  return getDayDiff(
    getStatementDate(
      account,
      fromDate
    ),
    fromDate
  );
}

export function getDaysUntilDue(
  account: Account,
  fromDate = new Date()
) {
  return getDayDiff(
    getPaymentDueDate(
      account,
      fromDate
    ),
    fromDate
  );
}
