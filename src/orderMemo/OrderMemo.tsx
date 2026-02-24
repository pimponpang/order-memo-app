import { useEffect, useRef } from "react";
import { initOrderMemo } from "./order_memo_v6";
import "./order_memo_v6.css";

export default function OrderMemo() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ReturnType<typeof initOrderMemo> | null>(null);
  const photoUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    apiRef.current = initOrderMemo(el);
    return () => {
      if (photoUrlRef.current) {
        URL.revokeObjectURL(photoUrlRef.current);
        photoUrlRef.current = null;
      }
    };
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoUrlRef.current) {
      URL.revokeObjectURL(photoUrlRef.current);
    }
    photoUrlRef.current = URL.createObjectURL(file);
    apiRef.current?.startWith(photoUrlRef.current);
    e.target.value = "";
  };

  return (
    <div className="viewport" ref={viewportRef}>
      <div className="bar">
        <div className="title">
          <div className="h">注文メモ</div>
          <div className="s" id="sub"></div>
        </div>

        <button className="btn" id="btnResetHeader">
          <span className="msr">restart_alt</span>撮り直し
        </button>
        <button className="btn" id="btnShow" disabled>
          <span className="msr">visibility</span>店員に見せる
        </button>
      </div>

      <div className="stage">
        <div className="empty on" id="empty">
          <div className="emptyHero">
            <div className="emptyGlyph" aria-hidden="true">
              <span className="msr">photo_camera</span>
            </div>
          </div>
          <div className="emptyH">まずは写真を撮る/選んでください</div>
          <div className="emptyS">
            メニューや注文したい料理の写真を撮影するか、<br />
            ギャラリーから画像を選んでください。
          </div>
          <div className="emptyRow">
            <label className="btn primary">
              <span className="msr">photo_camera</span>写真を撮る/選ぶ
              <input
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: "none" }}
                onChange={onFileChange}
              />
            </label>
          </div>
          <div className="emptyHint">
            操作：写真を<strong>タップ</strong>でピン追加／ピン<strong>タップ</strong>
            で+1／ピン<strong>長押し</strong>でメニュー名
          </div>
        </div>

        <div className="canvas" id="canvas" aria-label="メニュー">
          <div className="menu">
            <img id="img" alt="メニュー" />
          </div>
          <div className="hint" id="hint">
            タップ：ピン追加 / ピン：+1 / ピン長押し：名前
          </div>
        </div>
      </div>

      <div className="bottom">
        <div className="sum" id="sum">
          計 0点 <small id="sum2">（0ピン）</small>
        </div>
        <button className="btn" id="btnHelp">
          <span className="msr">help</span>使い方
        </button>
        <button className="btn" id="btnClear">
          <span className="msr">delete</span>全消し
        </button>
      </div>

      <div className="sheet" id="sheet" aria-hidden="true">
        <div className="sheetCard">
          <div className="sheetTitle">使い方</div>
          <div className="sheetText">
            ・写真をタップ：ピン追加（×1）<br />
            ・ピンをタップ：数量 +1<br />
            ・ピンを長押し：メニュー名入力（表示は省略可）<br />
            ・全消し：ピンをすべて削除
          </div>
          <div className="sheetRow">
            <button className="btn" id="btnClose">
              OK
            </button>
            <button className="btn primary" id="btnHint">
              ヒント切替
            </button>
          </div>
        </div>
      </div>

      <div className="labelModal" id="labelModal" aria-hidden="true">
        <div className="labelCard">
          <div className="labelTitle">メニュー名</div>
          <div className="labelSub">
            例：生 / ハイ / 唐揚げ / 枝豆（未入力OK）
          </div>
          <input
            className="labelInput"
            id="labelInput"
            type="text"
            inputMode="text"
            autoComplete="off"
            placeholder="メニュー名を入力"
          />
          <div className="labelRow">
            <button className="btn" id="btnLabelCancel">
              キャンセル
            </button>
            <button className="btn primary" id="btnLabelSave">
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
