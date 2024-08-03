export default function CompanySettings() {
  return (
    <div>
      <h1 className="setting-head">Company Settings</h1>
      <h2 className="setting-sub-head">
        Have an open source game development company? Make it official by adding
        your company name and and submitting.
      </h2>

      <div className="comment-reply">
        <textarea
          name="text"
          cols={30}
          maxLength={30}
          rows={1}
          style={{ overflow: "hidden", resize: "none" }}
          placeholder="Company Name"
        />
        <button>Submit</button>
      </div>
    </div>
  );
}
