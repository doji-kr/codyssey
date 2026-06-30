# ──────────────────────────────────────────────────────────────
#   prompt-manager  ::  stash your prompts. summon them at will.
# ──────────────────────────────────────────────────────────────
#   [ crafted by ]   doji
#   [ contact    ]   dotteda@gmail.com
#   [ stack      ]   python3 · rich · pure terminal
#   [ status     ]   it works on my machine ¯\_(ツ)_/¯
# ──────────────────────────────────────────────────────────────
# prompt_manager.py — AI 프롬프트 관리 프로그램

import json
from rich.console import Console
from rich.text import Text
from rich.panel import Panel
from rich.table import Table

console = Console()

FILE_NAME = "prompts.json"  # 저장할 파일 이름

# 프롬프트를 담는 리스트. 딕셔너리 하나 = 프롬프트 하나.
prompts = [
    {
        "title": "블로그 글 작성",
        "content": "다음 주제로 블로그 글을 써줘. 제목, 소제목, 본문 순서로 구성하고 2000자 내외로 작성해.",
        "category": "텍스트 생성",
        "favorite": False,
    },
    {
        "title": "수채화풍 풍경 이미지",
        "content": "A serene mountain landscape at sunset, watercolor style, soft pastel colors, highly detailed, 4K.",
        "category": "이미지 생성",
        "favorite": True,
    },
    {
        "title": "친절한 고객 상담 페르소나",
        "content": "너는 10년 경력의 고객 상담 전문가야. 항상 공감하는 말투로 답하고, 문제 해결을 최우선으로 해.",
        "category": "페르소나",
        "favorite": False,
    },
]


def show_logo():
    logo = r"""
 ▄█████  ▄▄▄  ▄▄▄▄  ▄▄ ▄▄  ▄▄▄▄  ▄▄▄▄ ▄▄▄▄▄ ▄▄ ▄▄   █████▄ ▄▄▄▄   ▄▄▄  ▄▄   ▄▄ ▄▄▄▄ ▄▄▄▄▄▄   ▄▄ ▄▄ ▄██
 ██     ██▀██ ██▀██ ▀███▀ ███▄▄ ███▄▄ ██▄▄  ▀███▀   ██▄▄█▀ ██▄█▄ ██▀██ ██▀▄▀██ ██▄█▀  ██     ██▄██  ██
 ▀█████ ▀███▀ ████▀   █   ▄▄██▀ ▄▄██▀ ██▄▄▄   █     ██     ██ ██ ▀███▀ ██   ██ ██     ██      ▀█▀   ██
"""
    taglines = [
        "> stash your prompts. summon them at will.",
        "> a home for the prompts you keep losing.",
        "> [ doji ] · prompt vault · v1.0.0",
        "> built in the terminal, for the terminal.",
        "> 99 prompts on the wall, 0 lost in chat logs.",
    ]

    console.print(logo, style="cyan", highlight=False)
    for line in taglines:
        console.print(line, style="bright_black")


def show_menu():
    # 사용자에게 선택지를 보여주는 함수
    # 각 항목: (번호, 레이블, 색상)  번호가 None이면 그룹 헤더
    menu_groups = [
        (None, "  ◆  생성",            "bold green"),
        ("1",  "프롬프트 추가",         "green"),
        (None, "  ◆  조회",            "bold cyan"),
        ("2",  "전체 목록 보기",        "cyan"),
        ("3",  "카테고리별 조회",       "cyan"),
        ("4",  "키워드 검색",           "cyan"),
        ("5",  "상세 보기",             "cyan"),
        (None, "  ◆  관리",            "bold yellow"),
        ("6",  "즐겨찾기 관리",         "yellow"),
        ("7",  "마크다운 내보내기",     "yellow"),
        (None, "",                      ""),
        ("0",  "종료",                  "bold red"),
    ]

    content = Text()
    first_group = True
    for number, label, color in menu_groups:
        if number is None:
            # 첫 번째 헤더 앞에는 빈 줄을 넣지 않는다
            if label and not first_group:
                content.append("\n")
            if label:
                first_group = False
            content.append(f"{label}\n", style=color)
        else:
            content.append(f"   {number}  ", style=f"bold {color}")
            content.append(f"{label}\n",     style=color)

    console.print(Panel(content, title="MENU", border_style="cyan"))


def add_prompt():
    # 메뉴 1번: 프롬프트 추가
    console.print("\n[bold cyan]── 프롬프트 추가 ──[/bold cyan]")

    # 제목 입력 — 빈 값이면 다시 묻는다
    while True:
        title = input("제목: ").strip()
        if title != "":
            break
        console.print("제목을 입력해 주세요.", style="yellow")

    # 내용 입력 — 빈 값이면 다시 묻는다
    while True:
        content = input("내용: ").strip()
        if content != "":
            break
        console.print("내용을 입력해 주세요.", style="yellow")

    # 카테고리 선택
    categories = ["텍스트 생성", "이미지 생성", "영상 생성", "페르소나", "자동화", "기타"]

    cat_content = Text()
    for i in range(len(categories)):
        cat_content.append(f"  {i + 1}", style="bold cyan")
        cat_content.append(f"  {categories[i]}\n")
    cat_content.append("  0", style="bold cyan")
    cat_content.append("  직접 입력\n")
    console.print(Panel(cat_content, title="카테고리 선택", border_style="cyan"))

    category_choice = input("번호를 입력하세요: ").strip()

    if category_choice == "0":
        category = input("카테고리를 직접 입력하세요: ").strip()
        if category == "":
            category = "기타"
    elif category_choice.isdigit() and 1 <= int(category_choice) <= len(categories):
        category = categories[int(category_choice) - 1]
    else:
        console.print("올바르지 않은 번호입니다. 카테고리를 '기타'로 설정합니다.", style="yellow")
        category = "기타"

    # 딕셔너리로 만들어 리스트에 추가
    new_prompt = {
        "title": title,
        "content": content,
        "category": category,
        "favorite": False,
    }
    prompts.append(new_prompt)

    console.print(f"\n[green]✔ '{title}' 프롬프트가 추가되었습니다.[/green]")


def show_all():
    # 메뉴 2번: 전체 목록 보기
    if len(prompts) == 0:
        console.print("\n저장된 프롬프트가 없습니다.", style="yellow")
        return

    table = Table(title="전체 목록", border_style="cyan", header_style="bold cyan")
    table.add_column("번호", justify="center", width=4)
    table.add_column("제목")
    table.add_column("카테고리")
    table.add_column("즐겨찾기", justify="center", width=6)

    for i in range(len(prompts)):
        prompt = prompts[i]

        if prompt["favorite"]:
            star = Text("⭐", style="yellow")
        else:
            star = Text("")

        table.add_row(str(i + 1), prompt["title"], prompt["category"], star)

    console.print(table)


def show_by_category():
    # 메뉴 3번: 카테고리별 조회
    if len(prompts) == 0:
        console.print("\n저장된 프롬프트가 없습니다.", style="yellow")
        return

    # 현재 저장된 프롬프트에서 카테고리 목록을 중복 없이 뽑는다
    categories = []
    for prompt in prompts:
        if prompt["category"] not in categories:
            categories.append(prompt["category"])

    cat_content = Text()
    for i in range(len(categories)):
        cat_content.append(f"  {i + 1}", style="bold cyan")
        cat_content.append(f"  {categories[i]}\n")
    console.print(Panel(cat_content, title="카테고리 선택", border_style="cyan"))

    choice = input("번호를 입력하세요: ").strip()

    if not choice.isdigit() or not (1 <= int(choice) <= len(categories)):
        console.print("올바르지 않은 번호입니다.", style="yellow")
        return

    selected = categories[int(choice) - 1]

    table = Table(title=f"[{selected}] 목록", border_style="cyan", header_style="bold cyan")
    table.add_column("번호", justify="center", width=4)
    table.add_column("제목")
    table.add_column("즐겨찾기", justify="center", width=6)

    found_count = 0
    for i in range(len(prompts)):
        prompt = prompts[i]
        if prompt["category"] == selected:
            star = Text("⭐", style="yellow") if prompt["favorite"] else Text("")
            table.add_row(str(i + 1), prompt["title"], star)
            found_count += 1

    if found_count == 0:
        console.print("해당 카테고리에 프롬프트가 없습니다.", style="yellow")
    else:
        console.print(table)


def search_prompt():
    # 메뉴 4번: 검색
    keyword = input("\n검색어를 입력하세요: ").strip()

    if keyword == "":
        console.print("검색어를 입력해 주세요.", style="yellow")
        return

    table = Table(title=f"'{keyword}' 검색 결과", border_style="cyan", header_style="bold cyan")
    table.add_column("번호", justify="center", width=4)
    table.add_column("제목")
    table.add_column("카테고리")
    table.add_column("즐겨찾기", justify="center", width=6)

    found_count = 0

    for i in range(len(prompts)):
        prompt = prompts[i]

        # 대소문자 구분 없이 제목, 내용, 카테고리에 검색어가 있는지 확인
        title_match = keyword.lower() in prompt["title"].lower()
        content_match = keyword.lower() in prompt["content"].lower()
        category_match = keyword.lower() in prompt["category"].lower()

        if title_match or content_match or category_match:
            star = Text("⭐", style="yellow") if prompt["favorite"] else Text("")
            table.add_row(str(i + 1), prompt["title"], prompt["category"], star)
            found_count += 1

    if found_count == 0:
        console.print("검색 결과가 없습니다.", style="yellow")
    else:
        console.print(table)


def show_detail():
    # 메뉴 5번: 상세 보기
    if len(prompts) == 0:
        console.print("\n저장된 프롬프트가 없습니다.", style="yellow")
        return

    show_all()

    number = input("번호를 입력하세요: ").strip()

    # 숫자인지 확인
    if not number.isdigit():
        console.print("숫자를 입력해 주세요.", style="yellow")
        return

    index = int(number) - 1  # 사용자는 1번부터, 리스트는 0번부터

    # 범위 안에 있는지 확인
    if index < 0 or index >= len(prompts):
        console.print("올바르지 않은 번호입니다.", style="yellow")
        return

    prompt = prompts[index]

    if prompt["favorite"]:
        favorite_text = Text("⭐ 즐겨찾기", style="yellow")
    else:
        favorite_text = Text("즐겨찾기 안 함", style="bright_black")

    # Panel 안에 넣을 내용을 Text로 조합한다
    content = Text()
    content.append("제목     : ", style="bold cyan")
    content.append(f"{prompt['title']}\n")
    content.append("카테고리 : ", style="bold cyan")
    content.append(f"{prompt['category']}\n")
    content.append("즐겨찾기 : ", style="bold cyan")
    content.append(favorite_text)
    content.append("\n\n")
    content.append("내용\n", style="bold cyan")
    content.append(prompt["content"])

    console.print(Panel(content, title="상세 보기", border_style="cyan"))


def toggle_favorite():
    # 번호를 입력받아 즐겨찾기를 추가하거나 해제한다
    if len(prompts) == 0:
        console.print("\n저장된 프롬프트가 없습니다.", style="yellow")
        return

    show_all()

    number = input("번호를 입력하세요: ").strip()

    if not number.isdigit():
        console.print("숫자를 입력해 주세요.", style="yellow")
        return

    index = int(number) - 1

    if index < 0 or index >= len(prompts):
        console.print("올바르지 않은 번호입니다.", style="yellow")
        return

    prompt = prompts[index]

    # 현재 상태의 반대로 뒤집는다
    prompt["favorite"] = not prompt["favorite"]

    if prompt["favorite"]:
        console.print(f"\n[yellow]⭐ '{prompt['title']}' 을(를) 즐겨찾기에 추가했습니다.[/yellow]")
    else:
        console.print(f"\n[bright_black]'{prompt['title']}' 을(를) 즐겨찾기에서 해제했습니다.[/bright_black]")


def show_favorites():
    # 즐겨찾기된 프롬프트만 모아서 출력한다
    table = Table(title="즐겨찾기 목록", border_style="yellow", header_style="bold yellow")
    table.add_column("번호", justify="center", width=4)
    table.add_column("제목")
    table.add_column("카테고리")

    found_count = 0
    for i in range(len(prompts)):
        prompt = prompts[i]
        if prompt["favorite"]:
            table.add_row(str(i + 1), prompt["title"], prompt["category"])
            found_count += 1

    if found_count == 0:
        console.print("즐겨찾기한 프롬프트가 없습니다.", style="yellow")
    else:
        console.print(table)


def export_to_md():
    # 저장된 프롬프트 전체를 마크다운 파일로 내보낸다
    if len(prompts) == 0:
        console.print("\n저장된 프롬프트가 없습니다.", style="yellow")
        return

    MD_FILE = "prompts.md"

    with open(MD_FILE, "w", encoding="utf-8") as f:
        f.write("# AI 프롬프트 목록\n\n")

        for i in range(len(prompts)):
            prompt = prompts[i]

            if prompt["favorite"]:
                star = " ⭐"
            else:
                star = ""

            f.write(f"## {i + 1}. {prompt['title']}{star}\n\n")
            f.write(f"- **카테고리**: {prompt['category']}\n\n")
            f.write(f"### 내용\n\n")
            f.write(f"{prompt['content']}\n\n")
            f.write("---\n\n")

    console.print(f"\n[green]✔ '{MD_FILE}' 파일로 내보냈습니다. ({len(prompts)}개)[/green]")


def load_from_file():
    # JSON 파일에서 프롬프트 목록을 읽어 prompts 리스트에 불러온다
    global prompts  # 함수 안에서 전역 변수를 교체할 때 필요하다

    try:
        with open(FILE_NAME, "r", encoding="utf-8") as f:
            prompts = json.load(f)
        console.print(f"[bright_black]'{FILE_NAME}' 에서 {len(prompts)}개 불러왔습니다.[/bright_black]")
    except FileNotFoundError:
        console.print("[bright_black]저장된 파일이 없습니다. 기본 프롬프트로 시작합니다.[/bright_black]")


def save_to_file():
    # prompts 리스트를 JSON 파일로 저장한다
    with open(FILE_NAME, "w", encoding="utf-8") as f:
        json.dump(prompts, f, ensure_ascii=False, indent=2)
    console.print(f"[green]✔ '{FILE_NAME}' 에 저장했습니다.[/green]")


def manage_favorite():
    # 메뉴 6번: 즐겨찾기 관리 — 서브 메뉴
    sub_items = [("1", "즐겨찾기 추가 / 해제"), ("2", "즐겨찾기 목록 보기"), ("0", "돌아가기")]
    content = Text()
    for number, label in sub_items:
        content.append(f"  {number}", style="bold yellow")
        content.append(f"  {label}\n")
    console.print(Panel(content, title="즐겨찾기 관리", border_style="yellow"))

    choice = input("번호를 입력하세요: ").strip()

    if choice == "1":
        toggle_favorite()
    elif choice == "2":
        show_favorites()
    elif choice == "0":
        return
    else:
        console.print("올바르지 않은 번호입니다.", style="yellow")


def run():
    # 프로그램의 메인 루프
    # 메뉴를 보여주고 → 번호를 받고 → 해당 기능 실행 → 다시 메뉴로
    show_logo()
    load_from_file()  # 시작할 때 저장 파일을 불러온다

    while True:
        show_menu()
        choice = input("번호를 입력하세요: ").strip()

        if choice == "1":
            add_prompt()
        elif choice == "2":
            show_all()
        elif choice == "3":
            show_by_category()
        elif choice == "4":
            search_prompt()
        elif choice == "5":
            show_detail()
        elif choice == "6":
            manage_favorite()
        elif choice == "7":
            export_to_md()
        elif choice == "0":
            save_to_file()  # 종료하기 전에 저장한다
            console.print("\n[cyan]프로그램을 종료합니다. 안녕히 가세요![/cyan]")
            break
        else:
            # 목록에 없는 번호를 입력했을 때
            console.print("\n올바르지 않은 번호입니다. 다시 선택해 주세요.", style="yellow")


# 이 파일을 직접 실행할 때만 run()을 호출한다
if __name__ == "__main__":
    run()
