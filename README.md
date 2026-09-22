# MeterMate: แบ่งบิล

สร้างเว็บแอป mobile-first ภาษาไทยชื่อ "MeterMate" สำหรับแบ่งค่าน้ำและค่าไฟระหว่างเจ้าของบ้านกับผู้เช่า โดยออกแบบและเขียนโค้ดให้ใช้งานเป็น interactive prototype ที่สมบูรณ์บนมือถือก่อน

เงื่อนไขสำคัญ:
- ไม่ต้องมีระบบสมัครสมาชิกหรือ Login
- หน้าแรกให้เลือกบทบาท “เจ้าของ” หรือ “ผู้เช่า”
- ในอนาคตแต่ละบ้านจะเข้าผ่านลิงก์ token เฉพาะ แต่ใน prototype ให้สลับบทบาทได้จาก UI
- มีมิเตอร์หลักและมิเตอร์ย่อย แยกทั้งน้ำและไฟ
- เจ้าของจ่ายส่วนของมิเตอร์ย่อย
- ผู้เช่าจ่ายส่วนต่าง: หน่วยมิเตอร์หลัก − หน่วยมิเตอร์ย่อย
- ได้รับบิลรวมหนึ่งใบ แล้วระบบแบ่งยอดให้สองฝ่าย
- ค่า Ft คิดตามหน่วยของแต่ละฝ่าย
- ค่าบริการหารสอง
- VAT ของแต่ละฝ่ายคำนวณหลังรวมค่าใช้หน่วย + Ft + ส่วนแบ่งค่าบริการ
- รองรับหลายเดือนและดูประวัติย้อนหลัง
- จำนวนเงินใน prototype เป็น “ข้อมูลตัวอย่าง” และต้องมีข้อความกำกับว่าอัตราจริงต้องตั้งค่าตามหน่วยงาน/เดือน

สิทธิ์ผู้เช่า:
- อัปโหลดหรือถ่ายรูปมิเตอร์หลักของน้ำและไฟ
- อัปโหลดรูปบิลค่าน้ำ/ค่าไฟรวม
- เลือกกรอกเลขมิเตอร์เองได้
- หลังอัปโหลด ให้แสดงสถานะจำลอง “กำลังอ่านรูป” และผล OCR พร้อม confidence
- ผู้เช่าต้องตรวจและแก้เลขได้ก่อนกดยืนยัน
- เมื่อชำระแล้ว เลือกได้ระหว่าง:
  1) ติ๊ก “จ่ายแล้ว” พร้อมวันที่และช่องหมายเหตุ
  2) อัปโหลด/ถ่ายรูปสลิปเงิน
- เมื่อส่งสลิปให้แสดงสถานะ “รอเจ้าของตรวจสอบ”
- แสดงประวัติการชำระหลายเดือนและสถานะ: รอข้อมูล, รอชำระ, รอตรวจสอบ, ชำระแล้ว

สิทธิ์เจ้าของ:
- กรอกหรืออัปโหลดรูปมิเตอร์ย่อยน้ำ/ไฟ
- อัปโหลดบิลรวม
- ดูผลแบ่งยอดเจ้าของและผู้เช่า
- ตรวจสอบรูปมิเตอร์และสลิปของผู้เช่า
- กดรับรองการชำระแล้ว
- ดูประวัติรายเดือน
- มีหน้าตั้งค่าอัตรา โดยเก็บอัตราขั้นบันได ค่า Ft ค่าบริการ VAT และวันที่มีผลเป็นข้อมูลตัวอย่าง

หน้าที่ต้องมี:
1. Welcome / Role selection
2. Owner Dashboard
3. Tenant Dashboard
4. Add meter reading: เลือกน้ำ/ไฟ, หลัก/ย่อย, ถ่ายรูป, เลือกรูป, หรือกรอกเอง
5. OCR Review: image preview placeholder, detected digits, confidence, current/previous readings, validation
6. Upload combined utility bill
7. Monthly calculation detail with tabs น้ำ/ไฟ
8. Allocation detail: owner vs tenant, show formula and every line item
9. Payment page: checkbox paid, payment date, note, upload receipt
10. Owner payment verification page
11. Monthly history
12. Rate settings sample page

UX/UI:
- Mobile-first canvas around 390px, responsive on desktop with centered mobile layout
- ภาษาไทยทั้งหมด
- friendly, chunky, approachable design inspired by a children-friendly design system but still trustworthy for finance
- Fonts: Prompt for Thai; use Fredoka for large numbers/headlines if available
- Primary #3B82F6, Water #0EA5E9, Electricity #F59E0B, Highlight #FEF3C7, Success #22C55E, Error #EF4444
- white/subtle gray backgrounds, rounded 20px cards, 48px minimum touch targets
- large readable numbers, icons paired with text, bottom navigation
- cards, status badges, progress states, toast feedback, confirmation dialogs
- include realistic Thai sample data for Sep 2569 and earlier months
- include empty, loading, error, success states
- use local mock state/data for this first build; navigation and forms must work
- file uploads should show a local preview and filename even before backend integration
- payment and bill status updates should persist in localStorage for the prototype
- do not claim the OCR or official tariff is live; clearly label simulations and sample rates
- use Tailwind and shadcn/ui, organize components cleanly, and ensure no horizontal overflow on mobile

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b53df014-1228-4645-a1e8-90b21d625a5d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
