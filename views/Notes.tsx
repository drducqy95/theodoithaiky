
import React, { useState } from 'react';
import { ArrowLeftIcon } from '../components/icons';

const notesData = [
  {
    id: 'nutrition',
    title: 'Dinh dưỡng thai kỳ',
    content: [
      {
        heading: 'Các dưỡng chất quan trọng',
        points: [
          'Axit folic: Quan trọng cho sự phát triển hệ thần kinh của bé. Có trong rau lá xanh, các loại đậu, ngũ cốc.',
          'Sắt: Cần thiết để tạo máu, ngăn ngừa thiếu máu. Có trong thịt đỏ, cá, trứng, rau bina.',
          'Canxi: Giúp xây dựng xương và răng cho bé. Có trong sữa, sữa chua, phô mai, rau xanh.',
          'Protein: Cần cho sự phát triển của các cơ quan. Có trong thịt, cá, trứng, đậu.',
          'Uống đủ nước: Rất quan trọng cho cả mẹ và bé, khoảng 2-3 lít mỗi ngày.'
        ]
      },
      {
        heading: 'Thực phẩm cần tránh',
        points: [
          'Rượu, bia, thuốc lá, và các chất kích thích.',
          'Thực phẩm sống hoặc tái như sushi, gỏi, trứng lòng đào.',
          'Cá chứa hàm lượng thủy ngân cao (cá mập, cá kiếm).',
          'Pate và thịt nguội chưa được tiệt trùng kỹ.'
        ]
      },
      {
          heading: 'Lưu ý',
          points: ['Luôn tham khảo ý kiến bác sĩ hoặc chuyên gia dinh dưỡng để có chế độ ăn phù hợp nhất.']
      }
    ]
  },
  {
    id: 'milestones',
    title: 'Mốc quan trọng trong thai kỳ',
    content: [
      {
        heading: '3 tháng đầu (Tuần 1-13)',
        points: [
            'Tim thai bắt đầu đập (khoảng tuần 6-7).',
            'Hệ thần kinh và các cơ quan chính bắt đầu hình thành.',
            'Siêu âm xác nhận thai vào tử cung và đo độ mờ da gáy (tuần 11-13) để sàng lọc dị tật.'
        ]
      },
      {
        heading: '3 tháng giữa (Tuần 14-27)',
        points: [
            'Mẹ bắt đầu cảm nhận những cử động đầu tiên của bé (thai máy).',
            'Siêu âm hình thái học chi tiết (tuần 18-22) để kiểm tra sự phát triển của các cơ quan.',
            'Xét nghiệm sàng lọc tiểu đường thai kỳ (tuần 24-28).'
        ]
      },
       {
        heading: '3 tháng cuối (Tuần 28-40+)',
        points: [
            'Bé phát triển nhanh chóng, tăng cân nhiều.',
            'Theo dõi cử động thai thường xuyên.',
            'Khám thai định kỳ thường xuyên hơn để theo dõi sức khỏe mẹ và bé, chuẩn bị cho quá trình sinh nở.'
        ]
      }
    ]
  },
  {
    id: 'vaccination',
    title: 'Lịch tiêm chủng',
    content: [
      {
        heading: 'Các mũi tiêm quan trọng',
        points: [
          'Cúm (Flu shot): Có thể tiêm ở bất kỳ giai đoạn nào của thai kỳ. Giúp bảo vệ cả mẹ và bé khỏi bệnh cúm.',
          'Uốn ván - Bạch hầu - Ho gà (Tdap): Thường được tiêm vào khoảng tuần 27-36. Giúp tạo kháng thể bảo vệ bé khỏi bệnh ho gà trong những tháng đầu đời.',
          'Viêm gan B: Nếu mẹ có nguy cơ cao hoặc chưa tiêm, bác sĩ có thể khuyên tiêm trong thai kỳ.'
        ]
      },
      {
        heading: 'Lưu ý',
        points: ['Một số vắc-xin sống giảm độc lực (sởi, quai bị, rubella, thủy đậu) không được khuyến cáo trong thai kỳ.', 'Hãy thảo luận với bác sĩ về lịch tiêm chủng phù hợp và an toàn nhất cho bạn.']
      }
    ]
  },
  {
    id: 'essentials',
    title: 'Các đồ dùng cần thiết',
    content: [
      {
        heading: 'Cho mẹ',
        points: [
          'Vitamin và các loại thuốc bổ theo chỉ định của bác sĩ.',
          'Quần áo bầu rộng rãi, thoải mái.',
          'Gối ôm, gối hỗ trợ cho bà bầu.',
          'Sản phẩm chăm sóc da an toàn cho bà bầu.',
          'Túi đồ đi sinh: quần áo, đồ dùng vệ sinh cá nhân, tã người lớn, giấy tờ cần thiết.'
        ]
      },
      {
        heading: 'Cho bé (chuẩn bị trước sinh)',
        points: [
          'Nôi/cũi và chăn ga gối phù hợp.',
          'Ghế ngồi ô tô cho trẻ sơ sinh.',
          'Tã/bỉm, khăn ướt, kem hăm.',
          'Quần áo sơ sinh, bao tay, bao chân, mũ.',
          'Bình sữa, máy hút sữa (nếu cần), dụng cụ tiệt trùng.',
          'Chậu tắm, sữa tắm gội, khăn tắm cho bé.'
        ]
      }
    ]
  }
];

const NoteDetail: React.FC<{
    note: typeof notesData[0];
    onBack: () => void;
}> = ({ note, onBack }) => {
    return (
        <div>
            <div className="flex items-center mb-6">
                <button onClick={onBack} aria-label="Quay lại" className="p-2 -ml-2 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold">{note.title}</h2>
            </div>
            
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="space-y-6">
                    {note.content.map((section, index) => (
                        <div key={index}>
                            <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200">{section.heading}</h4>
                            <ul className="list-disc list-inside mt-2 space-y-2 text-gray-600 dark:text-gray-300">
                                {section.points.map((point, pIndex) => (
                                    <li key={pIndex}>{point}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Notes: React.FC = () => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const selectedNote = notesData.find(note => note.id === selectedNoteId);

  if (selectedNote) {
      return <NoteDetail note={selectedNote} onBack={() => setSelectedNoteId(null)} />;
  }

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {notesData.map((note, index) => (
          <button
            key={note.id}
            onClick={() => setSelectedNoteId(note.id)}
            className={`w-full flex justify-between items-center text-left py-4 px-4 ${index < notesData.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''} hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200`}
          >
            <h3 className="font-semibold text-lg text-indigo-700 dark:text-indigo-400">{note.title}</h3>
            <span className="text-gray-400 font-bold text-2xl transform -translate-y-px">›</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Notes;
