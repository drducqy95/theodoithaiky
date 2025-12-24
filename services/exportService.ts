
import { ParentInfo, Checkup, CountdownData } from '../types';

declare const jspdf: any;

interface ExportData {
  motherInfo: ParentInfo;
  fatherInfo: ParentInfo;
  checkups: Checkup[];
  countdownData: CountdownData;
}

const LAB_TEST_DEFINITIONS: Record<string, string> = {
  cbc: 'Tổng phân tích công thức tế bào máu ngoại vi',
  urinalysis: 'Tổng phân tích nước tiểu',
  biochemistry: 'Xét nghiệm sinh hóa máu',
  immunology: 'Xét nghiệm miễn dịch',
  microbiology: 'Xét nghiệm vi sinh',
  abdominalUltrasound: 'Siêu âm ổ bụng',
  fetalUltrasound: 'Siêu âm thai',
};

const FONT_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/standardFonts/Roboto-Regular.ttf';

async function loadFont(jsPDF: any) {
    try {
        const response = await fetch(FONT_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        const font = await response.arrayBuffer();
        const fontData = new Uint8Array(font);
        const fontName = 'Roboto';
        
        // Convert Uint8Array to base64 string
        let binary = '';
        const len = fontData.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(fontData[i]);
        }
        const base64Font = btoa(binary);

        jsPDF.addFileToVFS(`${fontName}.ttf`, base64Font);
        jsPDF.addFont(`${fontName}.ttf`, fontName, 'normal');
        jsPDF.setFont(fontName);
    } catch (error) {
        console.error("Could not load font. Using default.", error);
    }
}

const calculateGestationalAge = (visitDateStr: string, eddStr: string | null): string => {
    if (!eddStr || !visitDateStr) return '-';
    try {
        const visitDate = new Date(visitDateStr);
        const eddDate = new Date(eddStr);
        visitDate.setHours(0, 0, 0, 0);
        eddDate.setHours(0, 0, 0, 0);
        
        const pregnancyDuration = 280; // days
        const daysRemaining = (eddDate.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysRemaining > pregnancyDuration || daysRemaining < -42) return '-';

        const daysPast = pregnancyDuration - daysRemaining;
        const weeks = Math.floor(daysPast / 7);
        return `${weeks}`;
    } catch (e) {
        return '-';
    }
};

export const exportToPdf = async (data: ExportData) => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    await loadFont(doc);
    doc.setFont('Roboto');

    // --- PAGE 1 ---
    doc.setFontSize(20);
    doc.text('SỔ THEO DÕI SỨC KHOẺ BÀ MẸ', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text('(Dành cho phụ nữ trong thời kỳ mang thai)', 105, 28, { align: 'center' });

    doc.setFontSize(16);
    doc.text('I. HÀNH CHÍNH', 14, 40);

    const parentInfoBody = (parent: ParentInfo) => [
        ['Họ và tên', parent.fullName],
        ['Năm sinh', parent.dob ? parent.dob.split('-')[0] : ''],
        ['Địa chỉ', parent.address],
        ['Số điện thoại', parent.phone],
        ['Số CCCD', parent.nationalId],
        ['Số thẻ BHYT', parent.healthInsuranceId],
        ['Tiền sử bệnh', parent.medicalHistory]
    ].filter(row => row[1]);

    doc.autoTable({
        startY: 45,
        head: [['THÔNG TIN MẸ']],
        body: parentInfoBody(data.motherInfo),
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { font: 'Roboto' }
    });
    
    doc.autoTable({
        startY: doc.autoTable.previous.finalY + 5,
        head: [['THÔNG TIN CHA']],
        body: parentInfoBody(data.fatherInfo),
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { font: 'Roboto' }
    });
    
    doc.setFontSize(16);
    doc.text('II. LẦN CÓ THAI NÀY', 14, doc.autoTable.previous.finalY + 15);
    
    const pregnancyInfo = [];
    if (data.countdownData.method === 'lmp' && data.countdownData.inputs.lmp) {
        pregnancyInfo.push(['Ngày kinh chót:', new Date(data.countdownData.inputs.lmp).toLocaleDateString('vi-VN')]);
    }
    if (data.countdownData.edd) {
        pregnancyInfo.push(['Ngày dự sanh:', new Date(data.countdownData.edd).toLocaleDateString('vi-VN')]);
    }
    
    if (pregnancyInfo.length > 0) {
        doc.autoTable({
            startY: doc.autoTable.previous.finalY + 18,
            body: pregnancyInfo,
            theme: 'plain',
            styles: { font: 'Roboto', fontSize: 11 }
        });
    }

    // --- PAGE 2 ---
    doc.addPage();
    doc.setFont('Roboto');

    doc.setFontSize(16);
    doc.text('III. KHÁM THAI', 14, 20);

    const sortedCheckups = [...data.checkups].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const head = [['Lần', 'Ngày khám', 'Tuổi thai\n(tuần)', 'Cân nặng\n(kg)', 'Huyết áp\n(mmHg)', 'XN nước tiểu\n(Protein)', 'Xét nghiệm khác', 'Ghi chú và hẹn khám lại']];
    const body = sortedCheckups.map((checkup, index) => {
        const otherTests = Object.keys(checkup.labTests)
            .filter(key => key !== 'urinalysis')
            .map(key => LAB_TEST_DEFINITIONS[key] || key)
            .join(', ');
        
        const urinalysisResult = checkup.labTests.urinalysis?.content || '-';

        return [
            index + 1,
            new Date(checkup.date).toLocaleDateString('vi-VN'),
            calculateGestationalAge(checkup.date, data.countdownData.edd),
            checkup.generalExam.vitals.weight || '-',
            checkup.generalExam.vitals.bloodPressure || '-',
            urinalysisResult,
            otherTests || '-',
            `${checkup.conclusion || ''}\n${checkup.advice || ''}`
        ];
    });

    doc.autoTable({
        startY: 25,
        head: head,
        body: body,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229], halign: 'center', valign: 'middle' },
        styles: { font: 'Roboto', cellPadding: 2, fontSize: 9 },
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            1: { cellWidth: 20 },
            2: { halign: 'center', cellWidth: 15 },
            3: { halign: 'center', cellWidth: 18 },
            4: { halign: 'center', cellWidth: 20 },
            5: { cellWidth: 25 },
            6: { cellWidth: 30 },
            7: { cellWidth: 'auto' },
        }
    });

    const checkupsWithLabs = sortedCheckups.filter(c => Object.keys(c.labTests).length > 0);
    if (checkupsWithLabs.length > 0) {
        let startY = doc.autoTable.previous.finalY + 15;
        if (startY > 250) {
            doc.addPage();
            doc.setFont('Roboto');
            startY = 20;
        }

        doc.setFontSize(16);
        doc.text('IV. CHI TIẾT CẬN LÂM SÀNG', 14, startY);
        startY += 8;

        for (const checkup of checkupsWithLabs) {
            if (startY > 260) {
                doc.addPage();
                doc.setFont('Roboto');
                startY = 20;
            }
            
            doc.setFontSize(12);
            doc.setTextColor(100);
            doc.text(`Ngày khám: ${new Date(checkup.date).toLocaleDateString('vi-VN')}`, 14, startY);
            doc.setTextColor(0);
            startY += 2;

            const labBody = Object.entries(checkup.labTests).map(([key, result]) => {
                const testName = LAB_TEST_DEFINITIONS[key] || key;
                let resultText = result.type === 'file' ? `Tệp đính kèm: ${result.content}` : result.content;
                return [testName, resultText];
            });

            doc.autoTable({
                startY: startY,
                head: [['Tên xét nghiệm', 'Kết quả']],
                body: labBody,
                theme: 'striped',
                headStyles: { fillColor: [107, 114, 128] },
                styles: { font: 'Roboto', fontSize: 9 },
            });
            startY = doc.autoTable.previous.finalY + 10;
        }
    }

    doc.save(`SoTheoDoiThaiKy_${new Date().toISOString().slice(0,10)}.pdf`);
};
