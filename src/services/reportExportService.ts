import { Platform } from "react-native";

import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { Transaction } from "../features/transactions/types/transaction";
import { Account } from "../features/accounts/types/account";
import { formatMoney, AppCurrency } from "../store/settingsStore";

function downloadOnWeb(
  filename: string,
  content: string,
  type: string
) {
  if (typeof document === "undefined") {
    throw new Error("Browser export is not available.");
  }

  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function shareNative(
  filename: string,
  content: string,
  mimeType: string
) {
  const cacheDirectory = FileSystem.cacheDirectory;

  if (!cacheDirectory) {
    throw new Error("Cache directory is unavailable.");
  }

  const fileUri = `${cacheDirectory}${filename}`;

  await FileSystem.writeAsStringAsync(fileUri, content);

  const canShare = await Sharing.isAvailableAsync();

  if (!canShare) {
    throw new Error("Sharing is not available on this device.");
  }

  await Sharing.shareAsync(fileUri, {
    mimeType,
    dialogTitle: "Export MoneyFlow Report",
  });
}

function escapeCsv(value: unknown) {
  const text = String(value ?? "");

  if (
    text.includes(",") ||
    text.includes('"') ||
    text.includes("\n")
  ) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export async function exportTransactionsCsv(
  transactions: Transaction[],
  accounts: Account[]
) {
  const accountName = new Map(
    accounts.map((account) => [account.id, account.name])
  );

  const rows = [
    [
      "Date",
      "Type",
      "Details",
      "Account",
      "To Account",
      "Category",
      "Payment Type",
      "Amount",
      "Notes",
    ],
    ...transactions.map((transaction) => [
      transaction.date,
      transaction.type,
      transaction.details,
      accountName.get(transaction.accountId) ?? transaction.accountId,
      transaction.toAccountId
        ? accountName.get(transaction.toAccountId) ?? transaction.toAccountId
        : "",
      transaction.category ?? "",
      transaction.paymentType ?? "",
      transaction.amount,
      transaction.notes ?? "",
    ]),
  ];

  const csv = rows
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");

  const filename = `moneyflow-report-${Date.now()}.csv`;

  if (Platform.OS === "web") {
    downloadOnWeb(filename, csv, "text/csv");
    return;
  }

  await shareNative(filename, csv, "text/csv");
}

function escapePdfText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function buildSimplePdf(lines: string[]) {
  const contentLines = lines
    .slice(0, 34)
    .map((line, index) => {
      const y = 780 - index * 20;
      return `BT /F1 11 Tf 40 ${y} Td (${escapePdfText(line)}) Tj ET`;
    })
    .join("\n");

  const stream = `${contentLines}\n`;
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${stream.length} >> stream\n${stream}endstream endobj`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  });

  const xref = pdf.length;

  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });

  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xref}\n%%EOF`;

  return pdf;
}

export async function exportMonthlyPdf(
  params: {
    monthName: string;
    transactions: Transaction[];
    income: number;
    expense: number;
    balance: number;
    currency: AppCurrency;
  }
) {
  const lines = [
    "MoneyFlow Monthly Report",
    params.monthName,
    "",
    `Total Balance: ${formatMoney(params.balance, params.currency)}`,
    `Income: ${formatMoney(params.income, params.currency)}`,
    `Expense: ${formatMoney(params.expense, params.currency)}`,
    `Net: ${formatMoney(
      params.income - params.expense,
      params.currency
    )}`,
    `Transactions: ${params.transactions.length}`,
    "",
    "Recent Transactions",
    ...params.transactions.slice(0, 20).map((transaction) => {
      return `${transaction.date.slice(0, 10)} | ${
        transaction.type
      } | ${transaction.details} | ${formatMoney(
        transaction.amount,
        params.currency
      )}`;
    }),
  ];

  const pdf = buildSimplePdf(lines);
  const filename = `moneyflow-report-${Date.now()}.pdf`;

  if (Platform.OS === "web") {
    downloadOnWeb(filename, pdf, "application/pdf");
    return;
  }

  await shareNative(filename, pdf, "application/pdf");
}
