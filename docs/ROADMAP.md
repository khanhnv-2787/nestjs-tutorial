# Lộ trình học NestJS — RealWorld (Conduit)

Lộ trình bám theo **yêu cầu của mentor**, tracking qua pull request.
Nguyên tắc: mỗi PR là một mốc chạy được và test được, không nhảy cóc.

## Trạng thái

| PR | Nội dung | Trạng thái |
|----|----------|-----------|
| 1 | Init project + hello world + i18n + swagger | ✅ xong (gộp vào PR #2) |
| 2 | Migration thủ công + Authentication | ✅ xong (PR #2, #3) |
| 3 | Các API còn lại của User + upload avatar | 🟡 đang review (PR #4) |
| 4 | CRUD Articles | 🔜 **tiếp theo** |
| 5 | CRD Comments | ⬜ |
| 6 | E2E testing | ⬜ |

Đã merge: PR #1, #2, #3. Đang mở: **PR #4** (các API còn lại của User).

---

## Kiến thức mentor yêu cầu nắm được

**Cơ bản**

- [x] Setup được project
- [x] Hiểu và nắm được xử lý authentication
- [ ] Thực hiện được API CRUD theo chuẩn RESTful
- [x] Migrate database thủ công: add / apply / revert / reset
- [~] Format response: mapper thủ công ✅, validate params DTO ✅, **search / filter / pagination ⬜** (PR 4)

**Nâng cao**

- [x] API docs: Swagger
- [ ] Unit test & E2E test
- [x] Xử lý file (Multer — lưu local theo hướng private; chưa dùng Cloudinary)
- [ ] Gửi mail (`@nestjs/bull` + Redis) và lập lịch (`@nestjs/schedule`)

---

## Quy trình mỗi pull request

1. **Self review** — tự đọc lại diff trước khi mở PR
2. **Request Copilot review** → fix toàn bộ comment
3. **To mentor review** — chỉ sau khi đã xong bước 1 và 2

---

## PR 1 — Init project 🟡

**Mục tiêu:** dựng khung project + tài liệu API + đa ngôn ngữ.

- [x] Init NestJS project
- [x] `GET /api` hello world
- [ ] **Setup i18n** (`nestjs-i18n`) — message lỗi/thành công tách khỏi code
- [ ] **Setup Swagger** (`@nestjs/swagger`) — `/api/docs`

> ⚠️ PR #1 đã merge nhưng **thiếu i18n và Swagger**. Hai phần này cần làm bù
> trong một PR nhỏ riêng trước khi sang PR 3, vì PR 2 trở đi sẽ sinh nhiều
> message lỗi và endpoint — làm sớm thì không phải sửa lại hàng loạt.

**Đã làm thêm ngoài yêu cầu** (nền móng, giữ lại):

- [x] `@nestjs/config` + validate env bằng **zod** (`validate` + `safeParse`, `z.infer` sinh type `Env`)
- [x] `ValidationPipe` global `{ whitelist, forbidNonWhitelisted, transform }`
- [x] `app.setGlobalPrefix('api')`
- [x] Cấu trúc thư mục `src/{config,common,database,modules}/`

---

## PR 2 — Migration thủ công + Authentication 🟡

**Mục tiêu:** làm chủ migration bằng tay và toàn bộ luồng xác thực.

### Migration thủ công

- [x] MySQL 8.4 qua Docker Compose (cổng **3307**)
- [x] `TypeOrmModule.forRootAsync` + `ConfigService`, `synchronize: false`
- [x] `src/database/data-source.ts` cho TypeORM CLI (chạy ngoài Nest DI)
- [x] `migration:generate` (add) / `migration:run` (apply) / `migration:revert`
- [ ] **`migration:reset`** — script drop toàn bộ rồi chạy lại từ đầu
- [x] Entity `User` + migration `CreateUsersTable`

### Authentication

- [x] **Register** — `POST /api/users`, hash password bằng bcrypt (10 rounds)
- [ ] **Login** — `POST /api/users/login`, phát JWT
- [ ] **Logout** — `POST /api/users/logout`, đưa token vào **blacklist trên Redis** (TTL = thời hạn còn lại của token)
- [ ] **Get current user** — `GET /api/user`
- [ ] `JwtStrategy` + `JwtAuthGuard` (đăng ký global) + `@Public()` decorator + `Reflector`
- [ ] `@CurrentUser()` custom param decorator
- [ ] Guard optional-auth (route chạy được cả khi có và không có token)
- [ ] Thêm service Redis vào `docker-compose.yml`
- [ ] ❌ Xoá route tạm `GET /api/users/:id` khi đã có `GET /api/user`

> Lúc login phải `addSelect('user.password')` — cột này khai `select: false` nên
> query thường không trả về hash.

---

## PR 3 — Các API còn lại của User + upload avatar 🟡 ĐANG REVIEW (PR #4)

- [x] **Update User** — `PUT /api/user` (kèm: đổi mật khẩu thì thu hồi token hiện tại)
- [x] **Get Profile** — `GET /api/profiles/:username` (optional auth)
- [x] **Follow / Unfollow** — `POST` / `DELETE /api/profiles/:username/follow`, idempotent
- [x] Bảng nối `user_follows` (khoá chính ghép + `ON DELETE CASCADE`), field `following` theo user đang đăng nhập
- [x] Guard optional-auth + `@OptionalAuth()` (dời từ PR 2 sang)
- [x] Tách `TokenModule` để tránh phụ thuộc vòng

### Upload avatar — chọn hướng **PRIVATE**

- [x] Multer (`memoryStorage`, giới hạn 2MB, chỉ JPEG/PNG/WebP)
- [x] Hướng **private**: `GET /api/attachments/:id` bắt buộc đăng nhập, file nằm ngoài thư mục tĩnh
- [x] Bảng `attachments` polymorphic: `id` UUID, `attachableType` + `attachableId`, `path`, `fileName`, `fileType`, `fileSize`
- [x] Validate loại file và dung lượng trước khi lưu
- [x] Đổi avatar thì xoá ảnh cũ (cả file lẫn bản ghi)

> ⚠️ Lệch với mentor: upload tách thành `POST /api/user/avatar` thay vì gộp vào `PUT /api/user`
> (JSON + multipart không trộn chung được với DTO lồng nhau). **Đang chờ mentor xác nhận.**

---

## PR 4 — CRUD Articles ⬜

- [ ] **Create Article** — `POST /api/articles`, sinh `slug` từ title
- [ ] **List Articles** — `GET /api/articles` với **search / filter / pagination** (`tag`, `author`, `favorited`, `limit`, `offset`)
- [ ] **Feed Articles** — `GET /api/articles/feed` (chỉ user mình follow)
- [ ] **Get Article** — `GET /api/articles/:slug`
- [ ] **Update / Delete Article** — chỉ tác giả, kiểm tra quyền ở **service layer**
- [ ] **Favorite / Unfavorite** — `POST` / `DELETE /api/articles/:slug/favorite`
- [ ] Entity `Article`, `Tag` (ManyToMany), bảng nối `article_favorites`
- [ ] Serializer format response thống nhất
- [ ] Chú ý **N+1 query**: dùng `leftJoinAndSelect` thay vì load trong vòng lặp

---

## PR 5 — CRD Comments ⬜

- [ ] **Add Comment** — `POST /api/articles/:slug/comments`
- [ ] **Get Comments** — `GET /api/articles/:slug/comments`
- [ ] **Delete Comment** — `DELETE /api/articles/:slug/comments/:id`, chỉ tác giả
- [ ] Cascade delete khi article bị xoá

---

## PR 6 — E2E testing ⬜

- [ ] **Database test riêng**, tách hẳn khỏi DB dev
- [ ] Truncate DB sau **mỗi test case**
- [ ] Fake data trước mỗi test case
- [ ] Viết E2E cấp độ **C2** cho một controller bất kỳ (chạy full luồng code, kiểm tra kết quả trả về)

---

## Phần chưa xếp vào PR nào

Mentor liệt kê trong "kiến thức khác cần nắm" nhưng RealWorld API không có sẵn chỗ dùng.
Cần hỏi mentor xem gắn vào PR nào, hoặc làm thành PR phụ:

- [ ] Gửi mail bằng `@nestjs/bull` + Redis (gợi ý: mail chào mừng sau khi register)
- [ ] Lập lịch bằng `@nestjs/schedule` (gợi ý: job dọn token hết hạn khỏi blacklist)
- [ ] Cloudinary (thay cho lưu file local ở PR 3)

---

## Ghi chú kỹ thuật đã tích luỹ

**Môi trường**

- TypeORM 1.x cần **Node >= 22** (đã có `.nvmrc` + `engines`). Node cũ chỉ làm vỡ CLI còn app vẫn chạy → rất dễ tưởng nhầm là xong.
- Cổng 3306 bị MySQL 8.1.0 cài sẵn trên máy chiếm → container MySQL dùng **3307**.
- Mọi file TS phải nằm trong `src/`; để ngoài sẽ lệch layout `dist/` và hỏng `start:prod`.

**TypeORM**

- Cột `nullable: true` phải ghi `type` tường minh — union `string | null` chỉ phát ra metadata `Object`.
- `select: false` trên cột `password` là lớp phòng vệ tầng DB; vẫn cần mapper/serializer ở tầng response.
- Kiểm tra trùng hai lớp: `findOne` cho thông báo đẹp, ràng buộc UNIQUE + bắt lỗi MySQL **1062** chống race condition.

**Validation**

- `ValidationPipe` chỉ chạy khi kiểu tham số là **class**. `any` hoặc `interface` làm validation tắt **trong im lặng**.
- DTO lồng nhau bắt buộc cặp `@ValidateNested()` + `@Type()`; thiếu một trong hai thì luật bên trong bị bỏ qua hoàn toàn.
