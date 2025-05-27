interface ResultBoxProps {
  result: string;
}

const resultBox: React.FC<ResultBoxProps> = ({ result }: ResultBoxProps) => {
  return <p>{result}</p>;
};
export default resultBox;
