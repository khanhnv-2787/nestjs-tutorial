# Lộ trình học NestJS qua project RealWorld (Conduit)

Mục tiêu: mỗi giai đoạn học **1–2 khái niệm NestJS mới**, làm xong là chạy được và test được bằng REST client.
Nguyên tắc: không nhảy cóc — feature sau luôn dùng lại thứ feature trước đã dựng.

Trạng thái hiện tại: **đã xong Giai đoạn 0** — ConfigModule + zod validate env, ValidationPipe global, prefix `/api`, cấu trúc thư mục `src/common|config|modules`. Tiếp theo: Giai đoạn 1 (MySQL).

---

## Giai đoạn 0 — Nền móng project ✅ HOÀN THÀNH

**Học:** ConfigModule (dynamic module), ValidationPipe global, cấu trúc thư mục theo module.

- [x] `@nestjs/config` + file `.env` (NODE_ENV, PORT — thêm biến khi tới giai đoạn cần), `.env` nằm trong `.gitignore`
- [x] Validate biến môi trường lúc boot bằng **zod** (option `validate` + `safeParse`) — sai env thì app chết ngay lúc boot; `z.infer` sinh luôn TS type `Env`
- [x] `app.setGlobalPrefix('api')`
- [x] `ValidationPipe` global với `{ whitelist: true, forbidNonWhitelisted: true, transform: true }`
- [x] Cấu trúc thư mục: `src/config/`, `src/common/{decorators,filters,guards,interceptors}/`, `src/modules/`

**Checkpoint:** ✅ `GET /api` → 200, `GET /` → 404, `NODE_ENV=prod` → app từ chối khởi động, `node dist/main` chạy được.

> Ghi chú: exception filter dời sang Giai đoạn 9 (chưa có custom exception nào để bắt).
> Mọi file TS phải nằm trong `src/` — để ngoài sẽ làm lệch layout `dist/` và hỏng `start:prod`.

---

## Giai đoạn 1 — MySQL + ORM (1 ngày)

**Học:** dynamic module bất đồng bộ (`forRootAsync`), repository pattern, entity, migration.

- [ ] Cài `@nestjs/typeorm typeorm mysql2` + `dotenv` (devDep, cho CLI migration)
- [ ] MySQL chạy bằng Docker Compose (`docker-compose.yml`, service `mysql:8.4`)
- [ ] Thêm `DB_*` vào zod schema — `Env` type tự lớn theo
- [ ] `TypeOrmModule.forRootAsync` + `inject: [ConfigService]` — **không** hardcode credential
- [ ] `synchronize: false` ngay từ đầu, dùng **migration** thật
- [ ] `src/database/data-source.ts` cho TypeORM CLI (chạy NGOÀI Nest DI, tái dùng `validateEnv`)
- [ ] Script `migration:generate` / `migration:run` / `migration:revert` trong package.json
- [ ] Entity đầu tiên: `User` (id, email unique, username unique, password `select: false`, bio, image, createdAt, updatedAt)

**Checkpoint:** `pnpm migration:run` tạo được bảng `users` trong MySQL; app boot lên kết nối DB thành công.

---

## Giai đoạn 2 — Users: đăng ký + đọc/sửa profile (1 ngày)

**Học:** module/controller/service/repository, DTO + class-validator, custom provider (hash password).

- [ ] `POST /api/users` — signup
- [ ] Hash password bằng **bcrypt** (hoặc argon2), không bao giờ lưu plain text
- [ ] DTO `CreateUserDto` với `@IsEmail`, `@MinLength`…
- [ ] Không bao giờ trả `password` ra response — dùng `@Exclude()` + `ClassSerializerInterceptor`, hoặc mapper thủ công
- [ ] `GET /api/user` và `PUT /api/user` (làm phần route trước, phần bảo vệ để giai đoạn 3)

**Checkpoint:** signup 2 lần cùng email → lỗi 422/409 rõ ràng, không phải lỗi MySQL raw lòi ra ngoài.

---

## Giai đoạn 3 — JWT Auth (1–1.5 ngày) ⭐ giai đoạn quan trọng nhất

**Học:** Guard, Passport strategy, custom param decorator, metadata/Reflector.

- [ ] `POST /api/users/login` — so sánh password, phát JWT
- [ ] `@nestjs/jwt` + `@nestjs/passport` + `passport-jwt`
- [ ] `JwtStrategy` → `JwtAuthGuard`, đăng ký guard global
- [ ] `@Public()` decorator + `Reflector` để mở khoá route signup/login
- [ ] `@CurrentUser()` custom decorator lấy user từ request
- [ ] **Optional auth**: nhiều route (xem article, xem profile) hoạt động cả khi có và không có token → làm 1 guard riêng cho phép qua khi thiếu token
- [ ] Quay lại khoá `GET/PUT /api/user` của giai đoạn 2

> Về "logout button": JWT là stateless nên logout = client xoá token. Chưa cần refresh token / blacklist ở giai đoạn học này — ghi chú lại rồi làm sau nếu muốn học thêm.

**Checkpoint:** gọi route được bảo vệ mà không có token → 401; có token → thấy đúng user của mình.

---

## Giai đoạn 4 — Profiles + Follow (0.5–1 ngày)

**Học:** quan hệ ManyToMany tự tham chiếu, query builder.

- [ ] `GET /api/profiles/:username`
- [ ] `POST` / `DELETE /api/profiles/:username/follow`
- [ ] Bảng nối `user_follows (follower_id, following_id)`
- [ ] Field `following: boolean` trong response tính theo user đang đăng nhập

**Làm follow trước articles là có chủ ý:** response của article luôn nhúng `author.following`, có sẵn logic này thì phần article không phải sửa lại.

---

## Giai đoạn 5 — Articles CRUD (1–1.5 ngày)

**Học:** quan hệ OneToMany / ManyToMany, transaction, phân quyền theo ownership.

- [ ] Entity `Article` (slug unique, title, description, body, author) + `Tag` (ManyToMany)
- [ ] `POST /api/articles`, `GET /api/articles/:slug`, `PUT`, `DELETE`
- [ ] Sinh `slug` từ title (+ hậu tố ngẫu nhiên để tránh trùng)
- [ ] **Authorization**: chỉ tác giả mới sửa/xoá được → 403. Kiểm tra ở **service layer**, không chỉ ở controller
- [ ] `GET /api/tags`

**Checkpoint:** user A không sửa được article của user B.

---

## Giai đoạn 6 — List + phân trang + feed (1 ngày)

**Học:** query param DTO, transform/coerce kiểu dữ liệu, QueryBuilder với join + count.

- [ ] `GET /api/articles?tag=&author=&favorited=&limit=20&offset=0`
- [ ] DTO cho query param + `@Type(() => Number)`, chặn `limit` quá lớn (max 100)
- [ ] Trả về `{ articles, articlesCount }`
- [ ] `GET /api/articles/feed` — chỉ article của người mình follow
- [ ] Để ý **N+1 query**: dùng `leftJoinAndSelect` thay vì lazy load trong vòng lặp

---

## Giai đoạn 7 — Favorite (0.5 ngày)

- [ ] `POST` / `DELETE /api/articles/:slug/favorite`
- [ ] Bảng nối `article_favorites`
- [ ] `favorited` + `favoritesCount` trong response
- [ ] Nối `favorited=` ở filter list của giai đoạn 6

---

## Giai đoạn 8 — Comments (0.5 ngày)

- [ ] `POST` / `GET` / `DELETE /api/articles/:slug/comments`
- [ ] Xoá cascade khi article bị xoá
- [ ] Chỉ tác giả comment được xoá

---

## Giai đoạn 9 — Hoàn thiện & chất lượng (1–2 ngày)

**Học:** testing với `@nestjs/testing`, interceptor, logging, tài liệu API.

- [ ] Swagger (`@nestjs/swagger`)
- [ ] Unit test service (mock repository) + e2e test cho luồng auth
- [ ] Global exception filter: log lỗi kèm context (requestId, userId) — không nuốt lỗi câm
- [ ] Custom exception classes thay vì `throw new Error()`
- [ ] Logging interceptor
- [ ] Chạy `pnpm sunlint` và sửa các vi phạm

---

## Thứ tự tóm tắt

```
0 Nền móng → 1 MySQL → 2 Users → 3 JWT ⭐ → 4 Follow
→ 5 Articles → 6 Pagination/Feed → 7 Favorite → 8 Comments → 9 Test & polish
```

Tổng khoảng **8–10 ngày** làm túc tắc. Sau mỗi giai đoạn nên commit riêng để dễ nhìn lại đã học gì.

## Vài lời khuyên khi học

- Sau mỗi giai đoạn, đọc lại đúng chương tương ứng trong docs NestJS (Guards, Interceptors, Custom decorators, Database) — lúc đó mới thấm vì đã có code thật để đối chiếu.
- Đừng generate cả module bằng AI ở giai đoạn 1–3. Đây là phần dạy bạn DI và request lifecycle; gõ tay sẽ đáng giá hơn nhiều.
- Test bằng file `.http` (REST Client của VS Code) hoặc Postman collection, lưu luôn trong repo.
