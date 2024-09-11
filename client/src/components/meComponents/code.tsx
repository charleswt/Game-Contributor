import "../../../public/css/style.css";
import React, { useState, useEffect } from "react";
import { formatDate } from "../../utils/utils";
import { useQuery, useMutation } from "@apollo/client";
import { GET_PUBLISHED_CODE, GET_RECIEVED_CODE } from "../../utils/queries";
import { APPROVE_CODE } from "../../utils/mutations";

interface Code {
  id: string;
  userId: string;
  inUse?: string;
  companyId: string;
  code: string;
  createdAt: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

export default function MeCode({ paramCompanyId }: { paramCompanyId: any }) {
  const [approvePublishedCode] = useMutation(APPROVE_CODE);
  const [pubdCodes, setPubdCodes] = useState<Code[]>([]);
  const [allCode, setAllCode] = useState<Code[]>([]);
  const [allApprovedCode, setAllApprovedCode] = useState<Code[]>([]);

  const { loading: codeLoading, data: codeData } = useQuery(GET_PUBLISHED_CODE);
  const { loading: loadingCode, data: codesData } = useQuery(GET_RECIEVED_CODE, {
    variables: { companyId: paramCompanyId },
  });

  useEffect(() => {
    if (codeData?.publishedCode) {
      setPubdCodes(codeData.publishedCode);
    }
  }, [codeData]);

  useEffect(() => {
    if (codesData?.recievedCode) {
      const notInUseCodes = codesData.recievedCode.filter((code: Code) => code.inUse === "false");
      const inUseCodes = codesData.recievedCode.filter((code: Code) => code.inUse === "true");

      if (notInUseCodes.length > 0) {
        setAllCode(notInUseCodes);
      }

      if (inUseCodes.length > 0) {
        setAllApprovedCode(inUseCodes);
      }
    }
  }, [loadingCode, codesData]);

  async function approveCode(codeId: string) {
    try {
      const { data } = await approvePublishedCode({
        variables: { codeId },
      });

      if (data && data.approveCode) {
        setAllCode((prevAllCode) => prevAllCode.filter((code) => code.id !== codeId));
        setAllApprovedCode((prevAllApprovedCode) => [...prevAllApprovedCode, data.approveCode]);
      }
    } catch (err) {
      console.error("Error approving code:", err);
    }
  }

  if (codeLoading) {
    return <div className="loader"></div>;
  }

  return (
    <>
      {pubdCodes.length > 0 && <div className="bg">Sent Code</div>}
      {pubdCodes.length > 0 ? (
        pubdCodes.map((code: Code) => (
          <div className="bg" key={code.id}>
            <p>
              <strong>Code Snippet:</strong> <code>{code.code}</code>
            </p>
            <p>
              <strong>Submitted on:</strong> {formatDate(code.createdAt)}
            </p>
          </div>
        ))
      ) : (
        <p className="bg">No outgoing code</p>
      )}

      {allCode.length > 0 && <div className="bg">Received Code</div>}
      {allCode.length > 0 ? (
        allCode.map((code: Code) => (
          <div className="bg" key={code.id}>
            <p>
              <strong>Submitted by:</strong> {code.firstName} {code.lastName}{" "}
              (@{code.username})
            </p>
            {/* <p>
              <strong>User ID:</strong> {code.userId}
            </p>
            <p>
              <strong>Company ID:</strong> {code.companyId}
            </p> */}
            <p>
              <strong>Code Snippet:</strong> <code>{code.code}</code>
            </p>
            <p>
              <strong>Submitted on:</strong> {formatDate(code.createdAt)}
            </p>
            <p>
              <button onClick={() => approveCode(code.id)}>Approve code for use</button>
            </p>
          </div>
        ))
      ) : (
        <p className="bg">No incoming code</p>
      )}

      {allApprovedCode.length > 0 && <div className="bg">Approved Code</div>}
      {allApprovedCode.length > 0 ? (
        allApprovedCode.map((code: Code) => (
          <div className="bg" key={code.id}>
            <p>
              <strong>Submitted by:</strong> {code.firstName} {code.lastName}{" "}
              (@{code.username})
            </p>
            {/* <p>
              <strong>User ID:</strong> {code.userId}
            </p>
            <p>
              <strong>Company ID:</strong> {code.companyId}
            </p> */}
            <p>
              <strong>Code Snippet:</strong> <code>{code.code}</code>
            </p>
            <p>
              <strong>Submitted on:</strong> {formatDate(code.createdAt)}
            </p>
          </div>
        ))
      ) : (
        <p className="bg">No code in use</p>
      )}
    </>
  );
}