// 초기 트랙 데이터
const tracks = {
  d: { color: "rgba(254, 45, 87, 1)", notes: [] },
  f: { color: "rgba(28, 121, 228, 1)", notes: [] },
  j: { color: "rgba(28, 121, 228, 1)", notes: [] },
  k: { color: "rgba(254, 45, 87, 1)", notes: [] },
};

// 노트 편집기 컨테이너
const editor = document.querySelector('.note-editor');
const output = document.getElementById('output');

// 트랙 생성 함수
function createTrack(trackKey) {
  const track = document.createElement('div');
  track.classList.add('track');
  track.dataset.track = trackKey;

  track.innerHTML = `
    <h3>Track ${trackKey.toUpperCase()}</h3>
    <div class="notes"></div>
    <button class="add-note">Add Note</button>
  `;

  // 노트 추가 버튼 이벤트
  track.querySelector('.add-note').addEventListener('click', () => {
    addNote(trackKey);
  });

  editor.appendChild(track);
}

// 노트 추가 함수
function addNote(trackKey, duration = 4, delay = 3) {
  const track = document.querySelector(`.track[data-track="${trackKey}"] .notes`);
  const lastNote = track.querySelector('.note:last-child');
  
  // 마지막 노트의 delay 값을 가져와 증가
  if (lastNote) {
    delay = parseFloat(lastNote.querySelector('.delay').value) + 1.0; // 1초 증가
  }

  const note = document.createElement('div');
  note.classList.add('note');

  note.innerHTML = `
    <label>Duration: <input type="number" class="duration" value="${duration}" step="0.1"></label>
    <label>Delay: <input type="number" class="delay" value="${delay}" step="0.1"></label>
    <button class="remove-note">Remove</button>
  `;

  // 삭제 버튼 이벤트
  note.querySelector('.remove-note').addEventListener('click', () => {
    note.remove();
    updateNotes();
  });

  track.appendChild(note);
  updateNotes();
}

// 노트 데이터 업데이트 함수
function updateNotes() {
  Object.keys(tracks).forEach(trackKey => {
    const notes = Array.from(document.querySelectorAll(`.track[data-track="${trackKey}"] .note`)).map(note => ({
      duration: parseFloat(note.querySelector('.duration').value),
      delay: parseFloat(note.querySelector('.delay').value),
    }));
    tracks[trackKey].notes = notes;
  });
}

// 노트 데이터를 JSON으로 내보내기
function exportNotes() {
  updateNotes();
  const result = Object.entries(tracks).reduce((output, [trackKey, trackData]) => {
    const notes = trackData.notes
      .map(note => `{ duration: ${note.duration}, delay: ${note.delay} }`)
      .join(",\n");
    output += `
${trackKey}: {
  color: "${trackData.color}",
  next: 0,
  notes: [ 
${notes}
  ]
},`;
    return output;
  }, "");

  // 출력
  const formattedOutput = `{\n${result}\n}`;
  output.textContent = formattedOutput; // HTML에 출력

  // 노트 시각화
  visualizeNotes();
}

function createTimeline() {
  const timelineContainer = document.querySelector('.timeline-container');
  timelineContainer.innerHTML = ''; // 기존 타임라인 초기화

  Object.keys(tracks).forEach(trackKey => {
    const track = tracks[trackKey];
    const timelineWrapper = document.createElement('div');
    timelineWrapper.style.display = 'flex';
    timelineWrapper.style.flexDirection = 'column';
    timelineWrapper.style.alignItems = 'center';

    const title = document.createElement('h4');
    title.textContent = `Track ${trackKey.toUpperCase()}`;
    title.style.marginBottom = '10px';

    const timeline = document.createElement('div');
    timeline.classList.add('timeline');
    timeline.dataset.track = trackKey;

    timelineWrapper.appendChild(title);
    timelineWrapper.appendChild(timeline);
    timelineContainer.appendChild(timelineWrapper);
  });
}

function setTimelineHeight(songDuration) {
  const timelineElements = document.querySelectorAll('.timeline');
  const pixelsPerSecond = 5; // 1초당 5px의 높이
  const timelineHeight = songDuration * pixelsPerSecond;

  timelineElements.forEach(timeline => {
    timeline.style.height = `${timelineHeight}px`; // 타임라인 높이 설정
  });
}

function setTimelineHeight(songDuration) {
  const timelineElements = document.querySelectorAll('.timeline');
  const pixelsPerSecond = 5; // 1초당 5px의 높이
  const timelineHeight = songDuration * pixelsPerSecond;

  timelineElements.forEach(timeline => {
    timeline.style.height = `${timelineHeight}px`; // 타임라인 높이 설정
  });
}

// 노래 길이를 기준으로 타임라인 높이 설정
const songDuration = 112; // 노래 길이 (초)
setTimelineHeight(songDuration);

function visualizeNotes() {
  createTimeline(); // 타임라인 초기화

  Object.keys(tracks).forEach(trackKey => {
    const track = tracks[trackKey];
    const timeline = document.querySelector(`.timeline[data-track="${trackKey}"]`);

    // BPM 기반 가이드라인 추가
    const bpm = 90; // 예: 120 BPM
    const songDuration = 112; // 노래 길이 (초)
    addGuidelines(timeline, bpm, songDuration);

    // 노트 추가
    track.notes.forEach(note => {
      const noteElement = document.createElement('div');
      noteElement.classList.add('note');
      noteElement.style.bottom = `${(note.delay / songDuration) * 100}%`; // 노래 길이(초)를 기준으로 위치 계산
      noteElement.style.backgroundColor = track.color; // 트랙 색상 적용
      timeline.appendChild(noteElement);
    });
  });
}

function addGuidelines(timeline, bpm, songDuration) {
  const interval = 60 / bpm; // 한 비트의 간격 (초)
  const totalBeats = Math.floor(songDuration / interval); // 전체 비트 수

  for (let i = 0; i <= totalBeats; i++) {
    const guideElement = document.createElement('div');
    guideElement.classList.add(i % 4 === 0 ? 'major-guide' : 'guide'); // 4박자마다 주요 가이드라인 추가
    guideElement.style.bottom = `${(i * interval / songDuration) * 100}%`; // 비트 위치 계산
    timeline.appendChild(guideElement);
  }
}
// 초기화
Object.keys(tracks).forEach(createTrack);

// 이벤트 리스너
document.getElementById('add-note').addEventListener('click', () => {
  Object.keys(tracks).forEach(trackKey => addNote(trackKey));
});

document.getElementById('export-notes').addEventListener('click', exportNotes);