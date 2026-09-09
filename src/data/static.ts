import type { Bank, Biller, BillCategory } from '../types'

export const banks: Bank[] = [
  { code: '044', name: 'Access Bank' },
  { code: '023', name: 'Citibank Nigeria' },
  { code: '063', name: 'Diamond Bank' },
  { code: '050', name: 'Ecobank Nigeria' },
  { code: '084', name: 'Enterprise Bank' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '214', name: 'First City Monument Bank' },
  { code: '058', name: 'Guaranty Trust Bank' },
  { code: '030', name: 'Heritage Bank' },
  { code: '301', name: 'Jaiz Bank' },
  { code: '082', name: 'Keystone Bank' },
  { code: '014', name: 'Mainstreet Bank' },
  { code: '076', name: 'Polaris Bank' },
  { code: '101', name: 'Providus Bank' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '068', name: 'Standard Chartered Bank' },
  { code: '232', name: 'Sterling Bank' },
  { code: '032', name: 'Union Bank of Nigeria' },
  { code: '033', name: 'United Bank for Africa' },
  { code: '215', name: 'Unity Bank' },
  { code: '035', name: 'Wema Bank' },
  { code: '057', name: 'Zenith Bank' },
  { code: '090175', name: 'OPay' },
  { code: '100022', name: 'Paga' },
  { code: '090110', name: 'Moniepoint' },
  { code: '090115', name: 'PalmPay' },
]

export const networks = [
  { id: 'mtn', name: 'MTN Nigeria', color: '#FFCB05' },
  { id: 'airtel', name: 'Airtel Nigeria', color: '#E40000' },
  { id: 'glo', name: 'Glo', color: '#00A651' },
  { id: '9mobile', name: '9mobile', color: '#008749' },
]

export const billers: Biller[] = [
  {
    id: 'airtime',
    category: 'airtime',
    name: 'Airtime Top-up',
    providers: networks.map((n) => ({ id: n.id, name: n.name })),
  },
  {
    id: 'data',
    category: 'data',
    name: 'Data Bundle',
    providers: [
      {
        id: 'mtn',
        name: 'MTN Data',
        plans: [
          { id: 'd200', label: '200MB / 2 days', price: 300, size: '200MB' },
          { id: 'd500', label: '1GB / 30 days', price: 500, size: '1GB' },
          { id: 'd1000', label: '2GB / 30 days', price: 1000, size: '2GB' },
          { id: 'd2000', label: '4.5GB / 30 days', price: 2000, size: '4.5GB' },
          { id: 'd5000', label: '15GB / 30 days', price: 5000, size: '15GB' },
        ],
      },
      {
        id: 'airtel',
        name: 'Airtel Data',
        plans: [
          { id: 'a300', label: '750MB / 30 days', price: 300, size: '750MB' },
          { id: 'a1000', label: '3GB / 30 days', price: 1000, size: '3GB' },
          { id: 'a2000', label: '8GB / 30 days', price: 2000, size: '8GB' },
          { id: 'a5000', label: '25GB / 30 days', price: 5000, size: '25GB' },
        ],
      },
      {
        id: 'glo',
        name: 'Glo Data',
        plans: [
          { id: 'g500', label: '1.8GB / 7 days', price: 500, size: '1.8GB' },
          { id: 'g1000', label: '5GB / 30 days', price: 1000, size: '5GB' },
          { id: 'g5000', label: '28GB / 30 days', price: 5000, size: '28GB' },
        ],
      },
      {
        id: '9mobile',
        name: '9mobile Data',
        plans: [
          { id: 'n500', label: '2GB / 14 days', price: 500, size: '2GB' },
          { id: 'n1000', label: '4GB / 30 days', price: 1000, size: '4GB' },
        ],
      },
    ],
  },
  {
    id: 'electricity',
    category: 'electricity',
    name: 'Electricity',
    providers: [
      {
        id: 'ikeja',
        name: 'Ikeja Electric (IKEDC)',
        packages: ['Prepaid', 'Postpaid'],
      },
      { id: 'eko', name: 'Eko Electricity (EKEDC)', packages: ['Prepaid', 'Postpaid'] },
      { id: 'abuja', name: 'Abuja Electricity (AEDC)', packages: ['Prepaid', 'Postpaid'] },
      { id: 'kaduna', name: 'Kaduna Electric', packages: ['Prepaid', 'Postpaid'] },
      { id: 'port-harcourt', name: 'Port Harcourt Electricity', packages: ['Prepaid', 'Postpaid'] },
    ],
  },
  {
    id: 'cable_tv',
    category: 'cable_tv',
    name: 'Cable TV',
    providers: [
      { id: 'dstv', name: 'DStv', packages: ['Padi', 'YangaLite', 'YangaLite', 'Compact', 'Compact Plus', 'Premium'] },
      { id: 'gotv', name: 'GOtv', packages: ['Supa', 'Max', 'Jolli', 'Jinja', 'Smallie'] },
      { id: 'startimes', name: 'StarTimes', packages: ['Nova', 'Basic', 'Classic', 'Premium'] },
    ],
  },
  {
    id: 'internet',
    category: 'internet',
    name: 'Internet',
    providers: [
      { id: 'spectranet', name: 'Spectranet', packages: ['Weekly', 'Monthly', 'Quarterly'] },
      { id: 'smile', name: 'Smile', packages: ['Weekly', 'Monthly'] },
      { id: 'swift', name: 'Swift Networks', packages: ['Home', 'Business'] },
    ],
  },
  {
    id: 'education',
    category: 'education',
    name: 'Education',
    providers: [
      { id: 'waec', name: 'WAEC e-Pin', packages: ['SSCE 6 Subjects'] },
      { id: 'jamb', name: 'JAMB / UTME', packages: ['UTME Registration', 'Result Checker'] },
      { id: 'schoolfees', name: 'School Fees', packages: ['Private University', 'Public University'] },
    ],
  },
  {
    id: 'other',
    category: 'other',
    name: 'Other Services',
    providers: [
      { id: 'insurance', name: 'Insurance', packages: ['Health', 'Motor'] },
      { id: 'govt', name: 'Government & Tolls', packages: ['VIO Renewal', 'LASG'] },
    ],
  },
]

export const categoryMeta: Record<BillCategory, { label: string; icon: string; color: string }> = {
  airtime: { label: 'Airtime', icon: 'Smartphone', color: '#049C47' },
  data: { label: 'Data', icon: 'Globe', color: '#2563EB' },
  electricity: { label: 'Electricity', icon: 'Zap', color: '#F59E0B' },
  cable_tv: { label: 'Cable TV', icon: 'Tv', color: '#7C3AED' },
  internet: { label: 'Internet', icon: 'Wifi', color: '#0EA5E9' },
  education: { label: 'Education', icon: 'GraduationCap', color: '#E11D48' },
  betting: { label: 'Betting', icon: 'Dices', color: '#DB2777' },
  other: { label: 'Other Services', icon: 'LayoutGrid', color: '#64748B' },
}

export const haighaUsers = [
  { name: 'Aisha Mohammed', phone: '08031234567' },
  { name: 'Musa Ibrahim', phone: '08022233445' },
  { name: 'Fatima Ali', phone: '08098765432' },
  { name: 'Yusuf Bello', phone: '08055556667' },
  { name: 'Zainab Umar', phone: '08012344321' },
  { name: 'Ibrahim Adamu', phone: '08011110000' },
]

export const bankDemoLookup: Record<string, { name: string }> = {
  '0123456789': { name: 'AISHA MOHAMMED' },
  '0041223141': { name: 'MUSA IBRAHIM' },
  '0201234567': { name: 'FATIMA ALI' },
  '0901221001': { name: 'YUSUF BELLO' },
  '0812345678': { name: 'ZAINAB UMAR' },
}
