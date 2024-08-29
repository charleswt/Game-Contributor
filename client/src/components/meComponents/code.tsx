import "../../../public/css/style.css";
import React, { useState, useEffect } from "react";
import { formatDate } from "../../utils/utils";
import { useQuery } from "@apollo/client";
import { GET_PUBLISHED_CODE, GET_PUBLISHED_CODES } from "../../utils/queries";

interface Code {
  id: string;
  userId: string;
  companyId: string;
  code: string;
  createdAt: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

export default function MeCode({ paramCompanyId }: { paramCompanyId: any }) {
  const { loading: codeLoading, data: codeData } = useQuery(GET_PUBLISHED_CODE);
  const [pubdCodes, setPubdCodes] = useState<Code[]>([]);  
  const { loading: loadingCode, data: codesData } = useQuery(
    GET_PUBLISHED_CODES,
    {
      variables: { companyId: paramCompanyId },
    }
  );
  const [allCode, setAllCode] = useState<Code[]>([]);

  useEffect(() => {
    if (codeData) {
      setPubdCodes(codeData.publishedCode);
      console.log(codeData);
    }
  }, [!codeLoading, codeData]);
  
  useEffect(() => {
    if (!loadingCode && codesData) {
      setAllCode(codesData.publishedCodesByCompany);
    }
  }, [loadingCode, codesData]);

  if (codeLoading) {
    return <div className="loader"></div>;
  }

  return (
    <>
      {pubdCodes.length > 0 && <div className="bg">Sent Code</div>}
      {pubdCodes.length > 0 ? (
            pubdCodes?.map((code: Code) => (
            <div className="bg" key={code.id}>
              <p>
                <strong>User ID:</strong> {code.userId}
              </p>
              <p>
                <strong>Company ID:</strong> {code.companyId}
              </p>
              <p>
                <strong>Code Snippet:</strong> <code>{code.code}</code>
              </p>
              <p>
                <strong>Submitted on:</strong> {formatDate(code.createdAt)}
              </p>
            </div>)
          )):(
            <div>You Have No Recieved Code</div>
          )}

      {allCode.length > 0 && <div className="bg">Recieved Code</div>}
          {allCode.length > 0 ? (
            allCode?.map((code: Code) => (
            <div className="bg" key={code.id}>
              <p>
                <strong>Submitted by:</strong> {code.firstName} {code.lastName}{" "}
                (@{code.username})
              </p>
              <p>
                <strong>User ID:</strong> {code.userId}
              </p>
              <p>
                <strong>Company ID:</strong> {code.companyId}
              </p>
              <p>
                <strong>Code Snippet:</strong> <code>{code.code}</code>
              </p>
              <p>
                <strong>Submitted on:</strong> {formatDate(code.createdAt)}
              </p>
            </div>)
          )):(
            <div>You Have No Recieved Code</div>
          )}
        
      
    </>
  );
}
