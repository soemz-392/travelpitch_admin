'use client';

import { useState } from 'react';
import { SurveySubmission } from '@/types';
import toast from 'react-hot-toast';

export default function SurveyFormPage() {
  const [formData, setFormData] = useState({
    // 기본 정보
    name: '',
    phone: '',
    email: '',
    phoneModel: '',
    naverId: '',
    snsLink: '',
    
    // SIM 유형
    simType: '',
    
    // 배송지 정보 (유심 선택 시)
    address: '',
    detailAddress: '',
    postalCode: '',
    
    // 여행 정보
    country: '',
    days: '',
    departureDate: '',
    arrivalDate: '',
    desiredStartDate: '',
    expectedPostDate: '',
    
    // 광고성 표기 동의
    adDisclosureAgree: false,
    
    // 메모
    adminMemo: '',
  });

  const [showShippingInfo, setShowShippingInfo] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // SIM 유형 변경 시 배송지 정보 표시/숨김
      if (name === 'simType') {
        setShowShippingInfo(value === 'usim');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 필수 항목 검증
    if (!formData.name || !formData.phone || !formData.email || !formData.phoneModel || !formData.simType || !formData.naverId || !formData.snsLink) {
      toast.error('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (formData.simType === 'usim' && (!formData.address || !formData.detailAddress)) {
      toast.error('유심 선택 시 배송지 정보를 입력해주세요.');
      return;
    }

    if (!formData.country || !formData.days || !formData.desiredStartDate || !formData.expectedPostDate) {
      toast.error('여행 정보를 모두 입력해주세요.');
      return;
    }

    if (!formData.adDisclosureAgree) {
      toast.error('광고성 표기 동의는 필수입니다.');
      return;
    }

    try {
      const submissionData: SurveySubmission = {
        id: Date.now().toString(),
        influencerEmail: formData.email,
        naverId: formData.naverId,
        name: formData.name,
        country: formData.country,
        days: parseInt(formData.days),
        desiredStartDate: new Date(formData.desiredStartDate),
        expectedPostDate: new Date(formData.expectedPostDate),
        adDisclosureAgree: formData.adDisclosureAgree,
        createdAt: { toDate: () => new Date() } as any,
        updatedAt: { toDate: () => new Date() } as any,
        // 추가 정보
        phone: formData.phone,
        phoneModel: formData.phoneModel,
        snsLink: formData.snsLink,
        simType: formData.simType,
        address: formData.address,
        detailAddress: formData.detailAddress,
        postalCode: formData.postalCode,
        departureDate: formData.departureDate,
        arrivalDate: formData.arrivalDate,
        adminMemo: formData.adminMemo,
      };

      // API 호출
      const response = await fetch('/api/survey-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        toast.success('설문이 성공적으로 제출되었습니다!');
        // 폼 초기화
        setFormData({
          name: '', phone: '', email: '', phoneModel: '', naverId: '', snsLink: '',
          simType: '', address: '', detailAddress: '', postalCode: '',
          country: '', days: '', departureDate: '', arrivalDate: '', desiredStartDate: '', expectedPostDate: '',
          adDisclosureAgree: false, adminMemo: '',
        });
        setShowShippingInfo(false);
      } else {
        toast.error('설문 제출에 실패했습니다.');
      }
    } catch (error) {
      toast.error('설문 제출 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            유심스토어 상품 발송 및 협찬 정보(eSIM, 유심)
          </h1>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="mb-2">
              아래 항목들은 상품 발송 및 개통을 위한 필수 정보입니다.
            </p>
            <p className="mb-2">
              특히 이메일, 전화번호, 입출국일, 개통 희망일은 정확히 입력해 주세요.
            </p>
            <p>
              방문하시려는 나라가 없는 경우, 하단 메모란에 상세 내용을 남겨주세요.
            </p>
          </div>
        </div>

        {/* 설문 폼 */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. 기본 정보 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              🧍‍♀️ 기본 정보
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  전화번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="010-1234-5678"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일 주소 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  휴대전화 기종 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="phoneModel"
                  value={formData.phoneModel}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="iPhone 13 Pro, Galaxy S22 등"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">eSIM 호환 여부 확인을 위해 필요합니다.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  네이버 ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="naverId"
                  value={formData.naverId}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SNS 링크 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="snsLink"
                  value={formData.snsLink}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="인스타그램, 블로그 등 리뷰 예정 채널 (예: @username, blog.naver.com/username)"
                  required
                />
              </div>
            </div>
          </div>

          {/* 2. 상품 유형 선택 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              📱 상품 유형 선택
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사용하실 SIM 유형을 선택해 주세요. <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="simType"
                    value="usim"
                    checked={formData.simType === 'usim'}
                    onChange={handleInputChange}
                    className="mr-2"
                    required
                  />
                  유심(USIM)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="simType"
                    value="esim"
                    checked={formData.simType === 'esim'}
                    onChange={handleInputChange}
                    className="mr-2"
                    required
                  />
                  이심(eSIM)
                </label>
              </div>
              {formData.simType === 'usim' && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    ✅ '유심(USIM)' 선택 시, 아래 배송지 항목이 자동으로 노출됩니다.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 배송지 정보 (유심 선택 시) */}
          {showShippingInfo && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                📦 배송지 정보 (유심 선택 시 필수)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    도로명 주소 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상세 주소 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="detailAddress"
                    value={formData.detailAddress}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    우편번호 (선택 또는 자동입력 가능)
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. 여행 정보 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              🌏 여행 정보
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  여행 국가 선택 <span className="text-red-500">*</span>
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">국가를 선택하세요</option>
                  <option value="EU">유럽</option>
                  <option value="VN">베트남</option>
                  <option value="TH">태국</option>
                  <option value="JP">일본</option>
                  <option value="US">미국</option>
                  <option value="CN">중국</option>
                  <option value="TW">대만</option>
                  <option value="PH">필리핀</option>
                  <option value="ID">인도네시아</option>
                  <option value="MY">말레이시아</option>
                  <option value="HK">홍콩마카오</option>
                  <option value="AU">호주</option>
                  <option value="SG">싱가포르</option>
                  <option value="IN">인도</option>
                  <option value="LA">라오스</option>
                  <option value="ETC">기타</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  여행 일수 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="days"
                  value={formData.days}
                  onChange={handleInputChange}
                  className="input-field"
                  min="1"
                  max="365"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  출국일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  입국일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="arrivalDate"
                  value={formData.arrivalDate}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  개통 희망일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="desiredStartDate"
                  value={formData.desiredStartDate}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  예상 포스팅 업로드일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="expectedPostDate"
                  value={formData.expectedPostDate}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  해당 일자에 포스팅 링크를 회신할 수 있는 링크가 발송됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* 4. 광고성 표기 동의 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              📢 광고성 표기 동의
            </h2>
            <div>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="adDisclosureAgree"
                  checked={formData.adDisclosureAgree}
                  onChange={handleInputChange}
                  className="mt-1 mr-3"
                  required
                />
                <span className="text-sm text-gray-700">
                  광고성 표기에 동의합니다. <span className="text-red-500">*</span>
                  <br />
                  <span className="text-gray-500">
                    콘텐츠 상단에 아래와 같은 문구를 넣어주세요.
                    <br />
                    [광고] 이 콘텐츠는 제품/서비스를 제공받아 작성되었습니다.
                    <br />
                    [협찬] 본 콘텐츠는 업체로부터 제품 및 서비스를 제공받아 작성되었습니다.
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* 메모 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              📝 메모
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                메모
              </label>
              <textarea
                name="adminMemo"
                value={formData.adminMemo}
                onChange={handleInputChange}
                className="input-field"
                rows={4}
                placeholder="특이사항이 있다면 상세 내용을 남겨주세요. ex) 방문하려는 나라가 리스트에 없거나, 복수 국가를 방문하는 경우"
              />
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="text-center">
            <button
              type="submit"
              className="btn-primary px-8 py-3 text-lg"
            >
              설문 제출하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
