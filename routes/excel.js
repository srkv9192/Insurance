const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const moment = require('moment');

const EXCEL_COLUMNS = [
  { header: 'Case Number', key: 'field1', width: 20 },
  { header: 'Case Inception Date', key: 'field2', width: 20 },
  { header: 'Patient Name', key: 'field3', width: 15 },
  { header: 'Patient Phone', key: 'field4', width: 20 },
  { header: 'Complainant Name', key: 'field5', width: 15 },
  { header: 'Complainant Phone', key: 'field6', width: 20 },
  { header: 'Manager Name', key: 'field7', width: 15 },
  { header: 'CP Name', key: 'field8', width: 20 },
  { header: 'Insurance Company Name', key: 'field9', width: 20 },
  { header: 'Claim Number', key: 'field10', width: 20 },
  { header: 'Claim Amount', key: 'field11', width: 20 },
  { header: 'Case Of', key: 'field12', width: 20 },
  { header: 'Operation Officer', key: 'field13', width: 20 },
  { header: 'Medical Officer', key: 'field14', width: 20 },
  { header: 'Case Status', key: 'field15', width: 20 },
  { header: 'Rejection Reason', key: 'field16', width: 30 },
  { header: 'Manual Gist Reason', key: 'field17', width: 30 },
  { header: 'Case Remarks', key: 'field18', width: 30 },
  { header: 'PF amount', key: 'field19', width: 20 },
  { header: 'Consultation charge', key: 'field20', width: 20 },
  { header: 'Cheque Amount', key: 'field21', width: 20 },
  { header: 'Cheque Number', key: 'field22', width: 20 },
  { header: 'Bank Name', key: 'field23', width: 20 },
  { header: 'Payment Mode', key: 'field24', width: 20 },
  { header: 'Payment Date', key: 'field25', width: 20 },
  { header: 'Payment Remark', key: 'field26', width: 20 },
  { header: 'Email', key: 'field27', width: 20 },
  { header: 'Password', key: 'field28', width: 20 },
  { header: 'Claim Type', key: 'field29', width: 20 },
  { header: 'Policy Number', key: 'field30', width: 20 },
  { header: 'Policy Inception Date', key: 'field31', width: 20 },
  { header: 'Hospital Name', key: 'field32', width: 20 },
  { header: 'Date Of Admission', key: 'field33', width: 20 },
  { header: 'Date Of Discharge', key: 'field34', width: 20 },
  { header: 'Diagnosis', key: 'field35', width: 20 },
  { header: 'Patient Complain', key: 'field36', width: 20 },
  { header: 'Rejection Reason', key: 'field37', width: 20 },
  { header: 'Rejection Date', key: 'field38', width: 20 },
  { header: 'Draft', key: 'field39', width: 40 },
  { header: 'Lokpal Draft', key: 'field40', width: 40 },
  { header: 'Escalation date', key: 'field41', width: 20 },
  { header: 'BHP number', key: 'field42', width: 20 },
  { header: 'Registration date', key: 'field43', width: 20 },
  { header: 'Annexure 5 number', key: 'field44', width: 20 },
  { header: 'Annexure 5 date', key: 'field45', width: 20 },
  { header: 'lokpal complain number', key: 'field46', width: 20 },
  { header: 'Annexure 6 date', key: 'field47', width: 20 },
  { header: 'Hearing date', key: 'field48', width: 20 },
  { header: 'Case Type', key: 'field49', width: 20 },
  { header: 'Case Completion Date', key: 'field50', width: 20 },
  { header: 'Case Result', key: 'field51', width: 20 },
  { header: 'Case Settlement amount', key: 'field52', width: 20 },
  { header: 'Customer Received amount', key: 'field53', width: 20 },
  { header: 'Customer Payment Date', key: 'field54', width: 20 },
  { header: 'Nidaan Received Amount', key: 'field55', width: 20 },
  { header: 'Nidaan Payment Date', key: 'field56', width: 20 },
  { header: 'Nidaan Received Mode', key: 'field57', width: 20 },
  { header: 'CP Amount', key: 'field58', width: 20 },
  { header: 'CP Received Amount', key: 'field59', width: 20 },
  { header: 'CP Received Transaction Number', key: 'field60', width: 20 },
  { header: 'CP Payment Date', key: 'field61', width: 20 },
  { header: 'CP Payment Mode', key: 'field62', width: 20 },
  { header: 'Live Case Date', key: 'field63', width: 20 },
];

function recordToRow(record) {
  return {
    field1: record.casereferenceNumber,
    field2: moment(record.prospectDate).format('DD-MM-YYYY'),
    field3: record.patientName,
    field4: record.patientMobile,
    field5: record.complainantName,
    field6: record.complainantMobile,
    field7: record.managerName,
    field8: record.cpName,
    field9: record.insuranceCompanyName,
    field10: record.claimNumber,
    field11: record.claimAmount,
    field12: record.caseHandler,
    field13: record.operationOfficer,
    field14: record.medicalOpinionOfficer,
    field15: record.newCaseStatus,
    field16: record.caseRejectionReason,
    field17: record.caseGist,
    field18: record.caseRemarks,
    field19: record.pfAmount,
    field20: record.cfPercentage,
    field21: record.cfAmount,
    field22: record.cfChequeNumber,
    field23: record.cfBankName,
    field24: record.pfpaymentMode,
    field25: record.pfpaymentDate,
    field26: record.pfpaymentRemarks,
    field27: record.caseEmail,
    field28: record.caseEmailPassword,
    field29: record.claimType,
    field30: record.policyNumber,
    field31: record.dateOfPolicy,
    field32: record.hospitalName,
    field33: record.dateOfAdmission,
    field34: record.dateOfDischarge,
    field35: record.diagnosis,
    field36: record.patientComplainDuringAdmission,
    field37: record.rejectionReason,
    field38: record.initialRejectionDate,
    field39: record.caseDraft,
    field40: record.lokpalDraft,
    field41: record.dateofEscalationToInsurer,
    field42: record.LokpalBHPComplaintNumber,
    field43: record.lokpalBHPComplaintDate,
    field44: record.annexure5ComplaintNumber,
    field45: record.annexure5ComplaintDate,
    field46: record.lokpalComplaintNumber,
    field47: record.lokpalComplaintDate,
    field48: record.dateOfLokpalHearing,
    field49: record.caseCompletionType,
    field50: record.completedDate,
    field51: record.caseResult,
    field52: record.caseSettlementAmount,
    field53: record.caseCustomerReceivedAmount,
    field54: record.caseCustomerReceivedAmountDate,
    field55: record.caseNidaanReceivedAmount,
    field56: record.caseNidaanReceivedAmountDate,
    field57: record.caseNidaanReceivedAmountMode,
    field58: record.caseCPFinalAmount,
    field59: record.caseCPFinalReceivedAmount,
    field60: record.caseCPPaymentTransactionNumber,
    field61: record.caseCPFinalReceivedAmountDate,
    field62: record.caseCPFinalReceivedAmountMode,
    field63: record.liveDate,
  };
}

async function sendExcel(res, records) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');
  worksheet.columns = EXCEL_COLUMNS;
  records.forEach(record => worksheet.addRow(recordToRow(record)));
  const buffer = await workbook.xlsx.writeBuffer();
  res.setHeader('Content-Disposition', 'attachment; filename=records.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
}

module.exports = function(dataSchemaObject) {
  router.get('/api/downloadExcel', async (req, res) => {
    try {
      const records = await dataSchemaObject.find({}).exec();
      await sendExcel(res, records);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.post('/api/downloadExcelbymedicalofficer', async (req, res) => {
    try {
      const records = await dataSchemaObject.find({ medicalOpinionOfficer: req.body.medicalOpinionOfficer }).exec();
      await sendExcel(res, records);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.post('/api/downloadExcelbystatus', async (req, res) => {
    try {
      const records = await dataSchemaObject.find({ newCaseStatus: req.body.casestatus }).exec();
      await sendExcel(res, records);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.post('/api/downloadExcelbylivedate', async (req, res) => {
    try {
      const records = await dataSchemaObject.find({
        liveDate: { $gte: req.body.livestartdate, $lte: req.body.liveenddate }
      }).exec();
      await sendExcel(res, records);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.post('/api/downloadExcelbynidaandate', async (req, res) => {
    try {
      const records = await dataSchemaObject.find({
        caseNidaanReceivedAmountDate: { $gte: req.body.nidaanstartdate, $lte: req.body.nidaanenddate }
      }).exec();
      await sendExcel(res, records);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  return router;
};
