import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { GET_ME } from "../../utils/queries";
import { CREATE_COMPANY } from "../../utils/mutations";
import "../../../public/css/style.css";

export default function CompanySettings() {
  const { loading: meLoading, error: meError, data: meData } = useQuery(GET_ME);
  const [createCompany] = useMutation(CREATE_COMPANY);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [companyValue, setCompanyValue] = useState<string>("");
  const [me, setMe] = useState<string>("");

  useEffect(() => {
    if (!meLoading && meData.me.company) {
      setMe(meData.me.company.companyName);
      console.log(meData.me.company.companyName);
    }
  }, [!meLoading, meData, !meData]);

  async function makeCompany(companyName: string) {
    console.log(companyName)
    try {
      const { data } = await createCompany({
        variables: { companyName },
      })

      if (data.createCompany) {
        setCompanyValue("");
        setErrorMessage("");
        setMe(data.createCompany.companyName)
      } else {
        setErrorMessage(
          "Company name already in use, please contact customer support for assistance."
        );
      }
    } catch (err) {
      setErrorMessage("An error occurred while creating the company.");
      throw err
    }
  }

  if (meLoading) return <div className="loader"></div>;
  if (meError) return <p>Error: {meError.message}</p>;

  return (
    <div>
      <h1 className="setting-head">Company Settings</h1>
      {!me ? (
        <>
          <h2 className="setting-sub-head">
            Have an open source game development company? Receive code from fellow
            developers looking to contribute or add a feature they may want to
            improve their gaming experience for free!
          </h2>

          <div className="comment-reply">
            <textarea
              name="text"
              cols={30}
              maxLength={30}
              rows={1}
              style={{ overflow: "hidden", resize: "none" }}
              placeholder="Company Name"
              value={companyValue}
              onChange={(e) => setCompanyValue(e.target.value)}
            />
            <button onClick={() => makeCompany(companyValue)}>Submit</button>
          </div>
          <div>{errorMessage}</div>
        </>
      ) : (
        <p>No company information available.</p>
      )}
    </div>
  );
}