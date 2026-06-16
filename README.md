# 구구름담배

ꔌ 마ગ 구구 갓... 비둘⌝ᥣ는 날スΙ 않ටㅏ. ュ저 담배를 마실 뿐ગスΙ. ュઐ 바로 ュ 뿐ગ야.

---

# Git 커밋 & PR 가이드

## 1. VSCode에서 커밋하기

1. 왼쪽 사이드바에서 **Source Control** 아이콘 클릭 <img width="35" height="51" alt="Screenshot 2026-04-20 at 2 24 46 PM" src="https://github.com/user-attachments/assets/8fdd364f-6bd0-46ce-8015-dc6dd1644aaa" />
2. 변경된 파일 옆에 **`+`** 버튼을 눌러서 내가 코밋하고 싶은 파일들을 스테이지에 추가 (모든 파일 한 번에 올리려면 `Changes` 옆의 `+`)
    - 하나씩 추가하는 이유: 하나는 clickShopScene 작업한 걸로 코밋하고 싶고, 다른 거는 이미지 추가로 커밋하고 싶을 수도 있잖아, 그럴때는 하나씩 추가하고 메세지 따로 쓰면 돼
3. 위쪽 메시지 입력창에 **커밋 메시지** 작성

### 커밋 메시지 예시

Added, Updated, Fix 이런 걸로 내가 한 일이 뭔지 표시하고 자세한 내용 더 써주면돼. (나는 괄호안에 더 추가로 가끔 설명쓰기도함)
다른 팀원이 봤을 때 아 뭐한거구나라고 감이 올 정도로 쓴다는 느낌.

```
Added: 새로운 파일이나 이미지, 폴더 등 추가하거나 만들었을 때
Updated: 파일 업데이트, 함수를 채워넣는 작성했을 때, 혹은 뭐 변경사항 있어서 업데이트 했을때, (오류가 나서 수정한것도 걍 updated로 쓰기도해 나는)
Fix: 오류 고친거
```

```
예시:

Added: fullgame.html js css 파일 추가 (우리 게임이 실행되는 최종파일)
Added: 아이템 이미지들 추가 (assets/items/ 파일)
Updated: buyItem()에서 자동으로 stock 차감하도록 함
Fix: 이름 철자 틀린거 고침
```

저미 깃 커밋 메세지 예시
<img width="949" height="511" alt="Screenshot 2026-04-20 at 2 34 43 PM" src="https://github.com/user-attachments/assets/bed65d99-312e-4066-b62b-58c05e50da34" />

4. **`Commit`** 버튼 클릭

---

## 2. GitHub Desktop에서 최신 상태 확인

언제나 언제나 fetch와 pull 먼저 **저미야알겠지?** 언제나 언제나

### 2-1. main 브랜치 확인

1. GitHub Desktop 앱 열기
2. 상단 **`Fetch origin`** 클릭
3. 브랜치 선택 드롭다운에서 **`main`** 브랜치 클릭
4. 새로운 변경사항이 있는지 확인

**새로운 변경사항이 있다면** → 내 브랜치로 돌아가서 **rebase** 해야 함 (2-2로 가세요)
**없다면** → 3번(Push)으로 건너뛰기

### 2-2. 내 브랜치에서 rebase

1. 브랜치 드롭다운에서 **내 브랜치**로 돌아오기 **너무너무너무 중요**
2. 상단 메뉴 **`Branch`** → **`Rebase current branch...`** 클릭
3. `main` 선택 → **`Start rebase`** 클릭
    - 이것의 의미는? 메인 브렌치에 있는 커밋 녀석들을 내 브렌치로 rebase(베이스를 바꿔준다, 메인이 base엿으면 이제는 내브렌치가 니 새로운 base란다) 한다는 뜻
4. 충돌이 있으면 **저미를 불러주세요 같이 쪼개볼 시간** -> VSCode에서 해결 후 다시 커밋

---

## 3. Push origin

1. GitHub Desktop에서 **`Push origin`** 버튼 클릭
    - 이것의 의미는? 서버에 잇는 내 브렌치로 push 해버리겟다
2. 내 브랜치의 변경사항이 GitHub에 올라감 짜가ㅈ작ㅈ짞

---

## 4. Pull Request 작성

하지만 아직 메인이 내 변경사항들을 받아들이지 않았죠? 그래서 pull request를 만들어서 합치라고 강요해요

### 4-1. PR 생성

1. GitHub Desktop에서 **`Create Pull Request`** 버튼 클릭
2. 브라우저가 열리며 PR 작성 페이지로 이동

### 4-2. 제목 작성

형식: `파일이름 어떤함수 (모두 / 개별 이름) 내가 한것`

**예시:**

```
clickShopScene.js 모든 함수 작성 완료
path.js playTurn() 수정
```

이렇게 아니어도 한거 뭔지 요약해서 쓰면 됩니다

### 4-3. 내용 작성

다음을 복사해서 상황에 맞게 이용해주세요 (새거 없으면 new파트 지워도 되고 등등) 아까 코밋이랑 똑같이 써도 되어요. 여러 코밋일 경우 그걸 걍 간단하게 요약하는 겨

```markdown
**NEW:**

- 파일이름: 새로운 파일, 이미지 등을 추가했을 때

**UPDATES:**

- 파일 이름: 한거
- 파일 이름: 한거
```

예시

```markdown
**NEW:**

- assets/items/: 아이템 이미지들 추가

**UPDATES:**

- clickShopScene.js: onBuyItem() 함수에서 성공 시 메시지를 띄우도록 변경함
- shop.js: click 변수 이름 오류 수정
```

```markdown
**UPDATES:**

- clickShopScene.js: 작성 완료햇고 다 작동하는거 같아요
```

### 4-4. Reviewer 지정

1. 오른쪽 사이드바 **`Reviewers`** 항목 클릭
2. **`hungrycrow33`** 선택하여 리뷰 요청

### 4-5. PR 생성

**`Create pull request`** 클릭
이제 저미한테 빨리 확인하라고 뭐라하세요

---

## 5. 리뷰 결과 처리

### 5-1. Approved 된 경우

1. PR 페이지에서 **`Squash and merge`** 클릭
2. 커밋 메시지 확인 후 **`Confirm squash and merge`**
3. **`Delete branch`** 클릭해서 브랜치 정리 (이 다음에 새로운 걸 또 시작할 때 새 브렌치를 만들어요)

### 5-2. Approved 되지 않은 경우 (수정 요청이 있을 때)

1. 점이의 코멘트 확인
2. 코멘트에 맞게 **질문에 답변** 또는 **코드 수정**
3. 수정 후 다시 VSCode에서 **커밋**
4. GitHub Desktop에서 **`Push origin`** 만 누르기
   → PR에 자동으로 추가됨 (새 PR 만들지 않음!)
5. 점이(hungrycrow33)에게 **"다시 확인해"** 라고 연락

---

## 6. 새로운 시작하기 (풀하고 새 브렌치 만들때)

### 6-1. 풀리퀘 보낸 거 확인하기

시점이가 approve 하고, squash and merge 한 후에,
'delete branch'를 합니다. (없애고 다시 시작하는거야)
(풀리퀘 안보냈으면 6-2부터 하면 됨)

### 6-2. main 브랜치 확인

1. GitHub Desktop 앱 열기
2. 브랜치 선택 드롭다운에서 **`main`** 브랜치 클릭
3. 상단 **`Fetch origin`** 클릭
4. 새로운 변경사항이 있는지 확인 (자신이 풀리퀘 보낸거 + 혹은 새로운 거 )

### 6-3. 새 브렌치 만들기

무조건 main 브랜치에서 풀을 한 최신 정보들을 가진 후에 새로운 브랜치를 만들어야합니다.
새로운 일이니까 새 브랜치에서 해요. 전에 하던 거 버려요.

1. 브랜치 드롭다운에서 'new branch' 선택
2. 이름은 지금 내가 할 일 이름으로 지으면 됩니다. 예를 들어 updateLungUI 등..fixerror1 이러기도함 나는
3. 새 브랜치 만들고, 새 브랜치로 선택해서 그 브랜치에 잘 앉아있는지 확인한 후, 히스토리탭에서도 아까 새로 받은 애들 있는지 함 보고 (push branch 버튼도 눌러요)
4. vscode를 켜서 새로운 일 하면 됩니다~ 홧팅!

---

### 깃 커밋 전체 흐름 한눈에

```
VSCode: 파일 + 추가 → 커밋 메시지 작성 → Commit
              ↓
GitHub Desktop: Fetch origin
              ↓
main 브랜치 변경 확인
   ├─ 있음 → 내 브랜치로 → Rebase → (충돌 해결)
   └─ 없음 → 건너뛰기
              ↓
Push origin
              ↓
Create Pull Request
   · 제목: Updated: 파일이름 함수
   · 내용: NEW / UPDATES 형식
   · Reviewers: hungrycrow33
              ↓
리뷰 결과
   ├─ Approved → Squash and merge → Delete branch
   └─ 수정 요청 → 코드 수정 → Commit → Push origin
                          → 점이에게 재확인 요청
```
